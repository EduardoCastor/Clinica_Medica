import { ClinicDomain, ResolvedTenantContext, AppEnvironmentMode } from '../types';
import { StorageService } from './storage';

const SIMULATION_STORAGE_KEY = 'medsync_simulated_domain';
const IMPERSONATION_STORAGE_KEY = 'medsync_impersonated_clinic_id';

export const PRODUCTION_DOMAINS = {
  SAAS_LANDING: 'medsync.beaverstraining.com.br',
  SAAS_ADMIN: 'painelclinica.beaverstraining.com.br',
  CLINIC_APP: 'app.drnewtonmureb.com.br',
  CLINIC_WEBSITE: 'www.drnewtonmureb.com.br',
  CLINIC_APEX: 'drnewtonmureb.com.br',
  CLINIC_BOOKING: 'agenda.drnewtonmureb.com.br',
} as const;

/**
 * Domain Resolver for MedSync SaaS Multi-tenant Architecture.
 * Strictly separates 5 operational domain contexts:
 * 1. SAAS_LANDING: medsync.beaverstraining.com.br (Commercial landing page)
 * 2. SAAS_ADMIN: painelclinica.beaverstraining.com.br (Super Admin SaaS portal)
 * 3. CLINIC_APP: app.drnewtonmureb.com.br (White-label clinic operational ERP)
 * 4. CLINIC_WEBSITE: www.drnewtonmureb.com.br / drnewtonmureb.com.br (Public institutional website)
 * 5. CLINIC_BOOKING: agenda.drnewtonmureb.com.br (Public standalone booking portal integrated with n8n)
 */
export const DomainResolver = {
  /**
   * Returns true only when running in development or preview environments
   * where the simulation toolbar should be available.
   */
  isSimulationAllowed(): boolean {
    if (typeof window === 'undefined') return true;
    const host = window.location.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.localhost') ||
      host.endsWith('.vercel.app') ||
      host.includes('.run.app') ||
      host.includes('.web.app') ||
      host.includes('usercontent.goog') ||
      host.includes('aistudio.google.com') ||
      host.includes('github.io')
    );
  },

  /**
   * Returns true if running on a verified production domain
   */
  isRealProductionDomain(): boolean {
    return !this.isSimulationAllowed();
  },

  /**
   * Retrieves any actively simulated domain from localStorage or URL parameter
   */
  getSimulatedDomain(): string | null {
    if (typeof window === 'undefined') return null;

    // 1. Check URL query string (?simulate_domain=app.drnewtonmureb.com.br)
    const urlParams = new URLSearchParams(window.location.search);
    const queryDomain = urlParams.get('simulate_domain');
    if (queryDomain) {
      localStorage.setItem(SIMULATION_STORAGE_KEY, queryDomain);
      return queryDomain;
    }

    // 2. Check localStorage
    return localStorage.getItem(SIMULATION_STORAGE_KEY);
  },

  /**
   * Overrides current domain simulation for testing & demonstration
   */
  setSimulatedDomain(domain: string | null): void {
    if (typeof window === 'undefined') return;
    if (domain) {
      localStorage.setItem(SIMULATION_STORAGE_KEY, domain);
    } else {
      localStorage.removeItem(SIMULATION_STORAGE_KEY);
    }
    window.dispatchEvent(new Event('medsync_domain_simulation_changed'));
  },

  /**
   * Gets currently impersonated clinic ID if Super Admin is supporting a clinic
   */
  getImpersonatedClinicId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(IMPERSONATION_STORAGE_KEY);
  },

  /**
   * Sets or clears clinic impersonation
   */
  setImpersonatedClinicId(clinicId: string | null): void {
    if (typeof window === 'undefined') return;
    if (clinicId) {
      localStorage.setItem(IMPERSONATION_STORAGE_KEY, clinicId);
    } else {
      localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    }
    window.dispatchEvent(new Event('medsync_domain_simulation_changed'));
  },

  /**
   * Cleans and normalizes a hostname
   */
  normalizeHostname(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .split(':')[0]; // strip port if any
  },

  /**
   * Resolves the current tenant context based on actual hostname or simulation
   */
  resolveTenant(): ResolvedTenantContext {
    if (typeof window === 'undefined') {
      return {
        resolved: false,
        mode: 'SAAS_LANDING',
        environment: 'saas_root',
      };
    }

    const realHostname = this.normalizeHostname(window.location.hostname);
    const simulationAllowed = this.isSimulationAllowed();
    const simulatedDomain = simulationAllowed ? this.getSimulatedDomain() : null;
    const effectiveDomain = simulatedDomain ? this.normalizeHostname(simulatedDomain) : realHostname;
    const impersonatingClinicId = this.getImpersonatedClinicId() || undefined;

    // 1. Check if effective domain is SaaS Commercial Landing
    if (
      effectiveDomain === PRODUCTION_DOMAINS.SAAS_LANDING ||
      effectiveDomain === 'medsync.io' ||
      effectiveDomain === 'medsync.com.br' ||
      effectiveDomain === 'landing'
    ) {
      return {
        resolved: true,
        mode: 'SAAS_LANDING',
        environment: 'saas_root',
        isSimulation: simulationAllowed && Boolean(simulatedDomain),
        impersonatingClinicId,
      };
    }

    // 2. Check if effective domain is SaaS Super Admin Panel
    if (
      effectiveDomain === PRODUCTION_DOMAINS.SAAS_ADMIN ||
      effectiveDomain === 'admin.medsync.io' ||
      effectiveDomain === 'superadmin' ||
      effectiveDomain === 'saas_admin'
    ) {
      return {
        resolved: true,
        mode: 'SAAS_ADMIN',
        environment: 'saas_root',
        isSimulation: simulationAllowed && Boolean(simulatedDomain),
        impersonatingClinicId,
      };
    }

    // 3. Check registered clinic domains in storage (exact or www alias)
    const matchedDomain = StorageService.findDomainByName(effectiveDomain);
    if (matchedDomain) {
      const isApp = matchedDomain.domainType === 'clinic_app' || matchedDomain.domainType === 'app';
      const isBooking =
        matchedDomain.domainType === 'clinic_booking' ||
        matchedDomain.domainType === 'booking' ||
        effectiveDomain.startsWith('agenda.');

      if (isBooking) {
        return {
          resolved: true,
          mode: 'CLINIC_BOOKING',
          environment: 'booking',
          domain: matchedDomain,
          organizationId: matchedDomain.organizationId,
          clinicId: matchedDomain.clinicId,
          isSimulation:
            simulationAllowed &&
            (Boolean(simulatedDomain) || this.normalizeHostname(window.location.hostname) !== matchedDomain.domain),
          impersonatingClinicId,
        };
      }

      return {
        resolved: true,
        mode: isApp ? 'CLINIC_APP' : 'CLINIC_WEBSITE',
        environment: isApp ? 'app' : 'website',
        domain: matchedDomain,
        organizationId: matchedDomain.organizationId,
        clinicId: matchedDomain.clinicId,
        isSimulation:
          simulationAllowed &&
          (Boolean(simulatedDomain) || this.normalizeHostname(window.location.hostname) !== matchedDomain.domain),
        impersonatingClinicId,
      };
    }

    // Fallback check for any agenda.* subdomain not yet added to local registry
    if (effectiveDomain.startsWith('agenda.') || effectiveDomain === 'agenda') {
      return {
        resolved: true,
        mode: 'CLINIC_BOOKING',
        environment: 'booking',
        organizationId: 'org_mureb_01',
        clinicId: 'clinic_mureb_01',
        isSimulation: simulationAllowed && Boolean(simulatedDomain),
        impersonatingClinicId,
      };
    }

    // 4. Default fallback behavior:
    // If running in development/preview without a specific simulation set,
    // default to CLINIC_APP with Dr. Newton Mureb's app domain for optimal developer inspection
    if (simulationAllowed) {
      const defaultAppDomain = StorageService.findDomainByName(PRODUCTION_DOMAINS.CLINIC_APP) || {
        id: 'dom_mureb_app',
        organizationId: 'org_mureb_01',
        clinicId: 'clinic_mureb_01',
        clinicName: 'Clínica Dr. Newton Mureb',
        domain: PRODUCTION_DOMAINS.CLINIC_APP,
        domainType: 'clinic_app',
        isVerified: true,
        isActive: true,
        verificationToken: 'medsync-verify-default',
        dnsStatus: 'verified',
        sslStatus: 'active',
        expectedCname: 'cname.vercel-dns.com',
        createdAt: new Date().toISOString(),
      };

      return {
        resolved: true,
        mode: 'CLINIC_APP',
        environment: 'app',
        domain: defaultAppDomain,
        organizationId: defaultAppDomain.organizationId,
        clinicId: defaultAppDomain.clinicId,
        isSimulation: true,
        impersonatingClinicId,
      };
    }

    // In production with unknown domain, fallback to commercial landing page
    return {
      resolved: false,
      mode: 'SAAS_LANDING',
      environment: 'saas_root',
      isSimulation: false,
    };
  },
};
