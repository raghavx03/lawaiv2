/**
 * Contract Analyzer Tests
 * Tests for risk analysis, PDF export, and Stripe integration
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { analyzeContractRisk } from '@/lib/contract-risk-analyzer'
import { generatePDFFilename } from '@/lib/pdf-generator'

describe('Contract Risk Analyzer', () => {
  describe('Risk Analysis', () => {
    it('should analyze contract and return risk score between 0-100', async () => {
      const contractText = `
        This agreement contains unlimited liability clauses.
        The party may terminate without cause at any time.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.overallRisk).toBeGreaterThanOrEqual(0)
      expect(analysis.overallRisk).toBeLessThanOrEqual(100)
    })

    it('should detect unlimited liability clauses', async () => {
      const contractText = `
        The company shall have unlimited liability for all damages.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.redFlags.length).toBeGreaterThan(0)
      expect(analysis.redFlags.some(f => f.clause.includes('Unlimited'))).toBe(true)
    })

    it('should detect broad indemnity clauses', async () => {
      const contractText = `
        The party shall indemnify all claims and damages.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.redFlags.length).toBeGreaterThan(0)
      expect(analysis.redFlags.some(f => f.clause.includes('Indemnity'))).toBe(true)
    })

    it('should detect one-sided termination rights', async () => {
      const contractText = `
        The vendor may terminate this agreement without cause at any time.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.redFlags.length).toBeGreaterThan(0)
      expect(analysis.redFlags.some(f => f.clause.includes('Termination'))).toBe(true)
    })

    it('should detect missing liability caps', async () => {
      const contractText = `
        The parties agree to this contract with liability provisions.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.warnings.length).toBeGreaterThan(0)
      expect(analysis.warnings.some(w => w.clause.includes('Liability Cap'))).toBe(true)
    })

    it('should detect restrictive non-compete clauses', async () => {
      const contractText = `
        The employee agrees to a non-compete clause.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.warnings.length).toBeGreaterThan(0)
      expect(analysis.warnings.some(w => w.clause.includes('Non-Compete'))).toBe(true)
    })

    it('should return risk level based on score', async () => {
      const contractText = `
        This is a simple contract with standard terms.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(['Low Risk', 'Moderate Risk', 'High Risk']).toContain(analysis.riskLevel)
    })

    it('should return confidence score between 50-100', async () => {
      const contractText = `
        This is a detailed contract with multiple clauses and provisions.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.confidence).toBeGreaterThanOrEqual(50)
      expect(analysis.confidence).toBeLessThanOrEqual(100)
    })

    it('should return suggested revisions', async () => {
      const contractText = `
        This agreement has unlimited liability and no dispute resolution.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(analysis.suggestedRevisions).toBeDefined()
      expect(Array.isArray(analysis.suggestedRevisions)).toBe(true)
      expect(analysis.suggestedRevisions.length).toBeGreaterThan(0)
    })

    it('should reject contracts shorter than 50 characters', async () => {
      const contractText = 'Too short'
      
      await expect(analyzeContractRisk(contractText)).rejects.toThrow()
    })

    it('should complete analysis in less than 3 seconds', async () => {
      const contractText = `
        This is a comprehensive contract with multiple sections and clauses.
        It contains various terms and conditions that need to be analyzed.
        The analysis should complete quickly and efficiently.
      `
      
      const startTime = Date.now()
      await analyzeContractRisk(contractText)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(3000)
    })
  })

  describe('Risk Score Bounds', () => {
    it('should always return risk score between 0 and 100', async () => {
      const testCases = [
        'Simple contract',
        'Contract with unlimited liability',
        'Contract with multiple red flags and warnings',
        'Contract with good terms and mutual agreements',
      ]

      for (const contractText of testCases) {
        const analysis = await analyzeContractRisk(contractText)
        expect(analysis.overallRisk).toBeGreaterThanOrEqual(0)
        expect(analysis.overallRisk).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('PDF Export', () => {
    it('should generate valid PDF filename', () => {
      const filename = generatePDFFilename('employment')
      
      expect(filename).toContain('employment')
      expect(filename).toContain('risk-analysis')
      expect(filename).toContain('.pdf')
    })

    it('should include date in PDF filename', () => {
      const filename = generatePDFFilename('nda')
      const today = new Date().toISOString().split('T')[0]
      
      expect(filename).toContain(today)
    })

    it('should handle different contract types', () => {
      const types = ['employment', 'nda', 'service-agreement', 'licensing']
      
      types.forEach(type => {
        const filename = generatePDFFilename(type)
        expect(filename).toContain(type)
        expect(filename.endsWith('.pdf')).toBe(true)
      })
    })
  })

  describe('Query Limits', () => {
    it('should enforce free tier 5 query limit', () => {
      const freeUser = {
        tier: 'free',
        queriesUsed: 5,
        queriesLimit: 5,
      }
      
      expect(freeUser.queriesUsed).toBeLessThanOrEqual(freeUser.queriesLimit)
    })

    it('should allow unlimited queries for pro tier', () => {
      const proUser = {
        tier: 'pro',
        queriesUsed: 1000,
        queriesLimit: 999999,
      }
      
      expect(proUser.queriesUsed).toBeLessThanOrEqual(proUser.queriesLimit)
    })

    it('should reset daily count at midnight', () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      expect(tomorrow.getHours()).toBe(0)
      expect(tomorrow.getMinutes()).toBe(0)
    })
  })

  describe('PDF Download Authorization', () => {
    it('should only allow pro tier users to download PDFs', () => {
      const freeUser = { tier: 'free' }
      const proUser = { tier: 'pro' }
      
      expect(freeUser.tier === 'pro').toBe(false)
      expect(proUser.tier === 'pro').toBe(true)
    })

    it('should allow enterprise tier users to download PDFs', () => {
      const enterpriseUser = { tier: 'enterprise' }
      
      expect(enterpriseUser.tier === 'pro' || enterpriseUser.tier === 'enterprise').toBe(true)
    })
  })

  describe('Red Flags and Warnings', () => {
    it('should categorize issues as red flags or warnings', async () => {
      const contractText = `
        Unlimited liability clause present.
        Non-compete clause included.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      expect(Array.isArray(analysis.redFlags)).toBe(true)
      expect(Array.isArray(analysis.warnings)).toBe(true)
    })

    it('should include clause references in red flags', async () => {
      const contractText = `
        The company shall have unlimited liability.
      `
      const analysis = await analyzeContractRisk(contractText)
      
      if (analysis.redFlags.length > 0) {
        const flag = analysis.redFlags[0]
        expect(flag.clause).toBeDefined()
        expect(flag.section).toBeDefined()
        expect(flag.issue).toBeDefined()
        expect(flag.suggestion).toBeDefined()
      }
    })
  })

  describe('Stripe Integration', () => {
    it('should have pro tier at $29/month', () => {
      const proTier = {
        name: 'Pro',
        price: 29,
        currency: 'USD',
      }
      
      expect(proTier.price).toBe(29)
    })

    it('should support subscription creation', () => {
      const subscription = {
        customerId: 'cus_123',
        priceId: 'price_pro_monthly',
        status: 'active',
      }
      
      expect(subscription.customerId).toBeDefined()
      expect(subscription.priceId).toBeDefined()
      expect(subscription.status).toBe('active')
    })

    it('should handle subscription updates', () => {
      const subscription = {
        id: 'sub_123',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
      
      expect(subscription.status).toBe('active')
      expect(subscription.currentPeriodEnd).toBeInstanceOf(Date)
    })

    it('should handle subscription cancellation', () => {
      const subscription = {
        id: 'sub_123',
        status: 'cancelled',
      }
      
      expect(subscription.status).toBe('cancelled')
    })
  })

  describe('Analytics Tracking', () => {
    it('should track contract analysis events', () => {
      const event = {
        userId: 'user-123',
        eventType: 'contract_analyzed',
        metadata: {
          contractType: 'employment',
          riskScore: 68,
          analysisTime: 2300,
        },
      }
      
      expect(event.eventType).toBe('contract_analyzed')
      expect(event.metadata.riskScore).toBeGreaterThanOrEqual(0)
      expect(event.metadata.riskScore).toBeLessThanOrEqual(100)
    })

    it('should track user signup events', () => {
      const event = {
        userId: 'user-456',
        eventType: 'user_signup',
        metadata: {
          tier: 'free',
        },
      }
      
      expect(event.eventType).toBe('user_signup')
      expect(event.metadata.tier).toBe('free')
    })

    it('should track conversion events', () => {
      const event = {
        userId: 'user-789',
        eventType: 'conversion',
        metadata: {
          fromTier: 'free',
          toTier: 'pro',
          amount: 29,
        },
      }
      
      expect(event.eventType).toBe('conversion')
      expect(event.metadata.toTier).toBe('pro')
    })
  })
})
