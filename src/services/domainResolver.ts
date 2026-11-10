import { ClinicDomain, ResolvedTenantContext } from '../types';
import { StorageService } from './storage';

const SIMULATION_STORAGE_KEY = 'medsync_simulated_domain';

/**
 * Domain Resolver for MedSync SaaS Multi-tenant Architecture.
 * Resolves whether the current visitor is accessing:
 * 1. An exclusive Administrative Clinic Panel ('app') -> e.g. app.drnewtonmureb.com.br
 * 2. An exclusive Institutional Public Website ('website') -> e.g. www.drnewtonmureb.com.br
 * 3. The general SaaS platform root / developer preview ('saas_root')
 */
export const DomainResolver = {
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
        environment: 'saas_root',
      };
    }

    const realHostname = this.normalizeHostname(window.location.hostname);
    const simulatedDomain = this.getSimulatedDomain();

    // Check if simulation is active
    if (simulatedDomain && simulatedDomain !== 'none') {
      const normalizedSim = this.normalizeHostname(simulatedDomain);
      const matchedDomain = StorageService.findDomainByName(normalizedSim);

      if (matchedDomain) {
        return {
          resolved: true,
          domain: matchedDomain,
          environment: matchedDomain.domainType,
          organizationId: matchedDomain.organizationId,
          clinicId: matchedDomain.clinicId,
          isSimulation: true,
        };
      }
    }

    // Check real hostname against registered domains
    const matchedDomain = StorageService.findDomainByName(realHostname);
    if (matchedDomain) {
      return {
        resolved: true,
        domain: matchedDomain,
        environment: matchedDomain.domainType,
        organizationId: matchedDomain.organizationId,
        clinicId: matchedDomain.clinicId,
        isSimulation: false,
      };
    }

    // Default: Root SaaS platform / preview
    return {
      resolved: false,
      environment: 'saas_root',
      isSimulation: false,
    };
  },

  /**
   * Returns true if running on a real custom domain (not localhost, not github.io, not dev cloud preview)
   */
  isRealCustomDomain(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host !== 'localhost' &&
      host !== '127.0.0.1' &&
      !host.includes('github.io') &&
      !host.includes('.run.app') &&
      !host.includes('.web.app')
    );
  }
};
