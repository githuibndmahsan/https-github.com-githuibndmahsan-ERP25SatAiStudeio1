import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { WebsiteContent } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/website - Get website studio config for current tenant
router.get('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const content = db.getRawData().websiteContents[tenantId];

  if (!content) {
    return res.status(404).json({ success: false, message: 'Website content not configured for this tenant.' });
  }

  res.json({ success: true, data: content });
});

// PUT /api/v1/website - Update website studio config
router.put('/', authenticate, requireTenantContext, requirePermission('website.publish'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();

  if (!data.websiteContents[tenantId]) {
    data.websiteContents[tenantId] = {
      institutionId: tenantId,
      heroTitle: 'Welcome to Our Institution',
      heroSubtitle: 'Academic excellence and leadership.',
      aboutText: 'Dedicated to education.',
      primaryColor: '#0284c7',
      secondaryColor: '#0f172a',
      isPublished: true,
      programs: [],
      facultyProfiles: [],
      notices: [],
      gallery: [],
      contactEmail: 'info@school.edu',
      contactPhone: '+92 300 0000000',
      address: 'Main Campus'
    };
  }

  Object.assign(data.websiteContents[tenantId], req.body);
  
  // Also update primary/secondary color on Institution entity
  const inst = data.institutions.find((i) => i.id === tenantId);
  if (inst) {
    if (req.body.primaryColor) inst.primaryColor = req.body.primaryColor;
    if (req.body.secondaryColor) inst.secondaryColor = req.body.secondaryColor;
  }

  db.persist();

  res.json({ success: true, message: 'Public website configuration published successfully.', data: data.websiteContents[tenantId] });
});

// GET /api/v1/public/site/:slug - Public Branded Website API (Unauthenticated, strictly safe public fields)
router.get('/public/site/:slug', (req: Request, res: Response) => {
  const slugOrCode = req.params.slug.toLowerCase();
  const data = db.getRawData();

  const inst = data.institutions.find(
    (i) => i.slug.toLowerCase() === slugOrCode || i.code.toLowerCase() === slugOrCode || i.subdomain.toLowerCase() === slugOrCode
  );

  if (!inst || inst.status === 'SUSPENDED') {
    return res.status(404).json({ success: false, message: 'Institution landing website not found or suspended.' });
  }

  const website = data.websiteContents[inst.id];

  // Return strictly public safe data (NO student counts, NO fee ledgers, NO roster)
  res.json({
    success: true,
    data: {
      institution: {
        code: inst.code,
        name: inst.name,
        slug: inst.slug,
        subdomain: inst.subdomain,
        address: inst.address,
        city: inst.city,
        phone: inst.phone,
        email: inst.email,
        primaryColor: inst.primaryColor,
        secondaryColor: inst.secondaryColor
      },
      content: website || {
        heroTitle: `Welcome to ${inst.name}`,
        heroSubtitle: 'Fostering future leaders through educational mastery.',
        aboutText: `${inst.name} is dedicated to modern educational development.`,
        primaryColor: inst.primaryColor,
        secondaryColor: inst.secondaryColor,
        programs: [],
        facultyProfiles: [],
        notices: [],
        gallery: []
      }
    }
  });
});

export default router;
