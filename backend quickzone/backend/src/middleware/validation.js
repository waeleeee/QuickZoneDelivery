const Joi = require('joi');

// Custom error messages
const customMessages = {
  'string.empty': '{{#label}} cannot be empty',
  'string.min': '{{#label}} must be at least {{#limit}} characters long',
  'string.max': '{{#label}} must not exceed {{#limit}} characters',
  'string.email': '{{#label}} must be a valid email address',
  'string.pattern.base': '{{#label}} format is invalid',
  'number.base': '{{#label}} must be a number',
  'number.min': '{{#label}} must be at least {{#limit}}',
  'number.max': '{{#label}} must not exceed {{#limit}}',
  'any.required': '{{#label}} is required',
  'any.only': '{{#label}} must be one of: {{#valids}}',
  'object.unknown': '{{#label}} is not allowed'
};

// Validation schemas
const schemas = {
  // User validation
  createUser: Joi.object({
    email: Joi.string().email().required().messages(customMessages),
    password: Joi.string().min(8).max(128).required().messages(customMessages),
    first_name: Joi.string().min(2).max(100).required().messages(customMessages),
    last_name: Joi.string().min(2).max(100).required().messages(customMessages),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages(customMessages),
    role: Joi.string().valid('admin', 'chef_agence', 'commercial', 'livreur', 'expediteur').required().messages(customMessages)
  }),

  updateUser: Joi.object({
    email: Joi.string().email().optional().messages(customMessages),
    first_name: Joi.string().min(2).max(100).optional().messages(customMessages),
    last_name: Joi.string().min(2).max(100).optional().messages(customMessages),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages(customMessages),
    role: Joi.string().valid('admin', 'chef_agence', 'commercial', 'livreur', 'expediteur').optional().messages(customMessages),
    is_active: Joi.boolean().optional().messages(customMessages)
  }),

  // Authentication validation
  login: Joi.object({
    email: Joi.string().email().required().messages(customMessages),
    password: Joi.string().required().messages(customMessages)
  }),

  // Commercial validation
  createCommercial: Joi.object({
    user_id: Joi.string().uuid().required().messages(customMessages),
    commission_rate: Joi.number().min(0).max(100).precision(2).default(10.00).messages(customMessages)
  }),

  updateCommercial: Joi.object({
    commission_rate: Joi.number().min(0).max(100).precision(2).optional().messages(customMessages)
  }),

  // Expediteur validation
  createExpediteur: Joi.object({
    user_id: Joi.string().uuid().required().messages(customMessages),
    commercial_id: Joi.string().uuid().optional().messages(customMessages),
    company_name: Joi.string().min(2).max(255).optional().messages(customMessages),
    address: Joi.string().min(5).max(500).required().messages(customMessages),
    city: Joi.string().min(2).max(100).required().messages(customMessages),
    postal_code: Joi.string().min(3).max(20).required().messages(customMessages),
    country: Joi.string().default('Tunisia').messages(customMessages),
    is_verified: Joi.boolean().default(false).messages(customMessages)
  }),

  updateExpediteur: Joi.object({
    commercial_id: Joi.string().uuid().optional().messages(customMessages),
    company_name: Joi.string().min(2).max(255).optional().messages(customMessages),
    address: Joi.string().min(5).max(500).optional().messages(customMessages),
    city: Joi.string().min(2).max(100).optional().messages(customMessages),
    postal_code: Joi.string().min(3).max(20).optional().messages(customMessages),
    country: Joi.string().optional().messages(customMessages),
    is_verified: Joi.boolean().optional().messages(customMessages)
  }),

  // Livreur validation
  createLivreur: Joi.object({
    user_id: Joi.string().uuid().required().messages(customMessages),
    vehicle_type: Joi.string().valid('Motorcycle', 'Car', 'Van', 'Truck').required().messages(customMessages),
    vehicle_plate: Joi.string().min(5).max(20).required().messages(customMessages),
    license_number: Joi.string().min(5).max(50).required().messages(customMessages),
    current_location_lat: Joi.number().min(-90).max(90).optional().messages(customMessages),
    current_location_lng: Joi.number().min(-180).max(180).optional().messages(customMessages),
    is_available: Joi.boolean().default(true).messages(customMessages)
  }),

  updateLivreur: Joi.object({
    vehicle_type: Joi.string().valid('Motorcycle', 'Car', 'Van', 'Truck').optional().messages(customMessages),
    vehicle_plate: Joi.string().min(5).max(20).optional().messages(customMessages),
    license_number: Joi.string().min(5).max(50).optional().messages(customMessages),
    current_location_lat: Joi.number().min(-90).max(90).optional().messages(customMessages),
    current_location_lng: Joi.number().min(-180).max(180).optional().messages(customMessages),
    is_available: Joi.boolean().optional().messages(customMessages)
  }),

  // Colis validation
  createColis: Joi.object({
    expediteur_id: Joi.string().uuid().required().messages(customMessages),
    livreur_id: Joi.string().uuid().optional().messages(customMessages),
    commercial_id: Joi.string().uuid().optional().messages(customMessages),
    weight: Joi.number().min(0.1).max(1000).precision(2).required().messages(customMessages),
    dimensions: Joi.string().pattern(/^\d+x\d+x\d+\s*cm$/).required().messages(customMessages),
    description: Joi.string().min(5).max(1000).optional().messages(customMessages),
    declared_value: Joi.number().min(0).max(100000).precision(2).optional().messages(customMessages),
    recipient_name: Joi.string().min(2).max(255).required().messages(customMessages),
    recipient_phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages(customMessages),
    recipient_address: Joi.string().min(5).max(500).required().messages(customMessages),
    recipient_city: Joi.string().min(2).max(100).required().messages(customMessages),
    recipient_postal_code: Joi.string().min(3).max(20).required().messages(customMessages),
    shipping_cost: Joi.number().min(0).max(10000).precision(2).required().messages(customMessages),
    estimated_delivery_date: Joi.date().min('now').optional().messages(customMessages)
  }),

  updateColis: Joi.object({
    livreur_id: Joi.string().uuid().optional().messages(customMessages),
    status: Joi.string().valid('pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned').optional().messages(customMessages),
    current_location: Joi.string().min(2).max(255).optional().messages(customMessages),
    commission_amount: Joi.number().min(0).max(10000).precision(2).optional().messages(customMessages),
    commission_paid: Joi.boolean().optional().messages(customMessages),
    picked_up_at: Joi.date().optional().messages(customMessages),
    delivered_at: Joi.date().optional().messages(customMessages),
    estimated_delivery_date: Joi.date().optional().messages(customMessages)
  }),

  // Mission validation
  createMission: Joi.object({
    livreur_id: Joi.string().uuid().required().messages(customMessages),
    title: Joi.string().min(5).max(255).required().messages(customMessages),
    description: Joi.string().min(10).max(1000).optional().messages(customMessages),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal').messages(customMessages),
    estimated_duration: Joi.number().min(15).max(1440).optional().messages(customMessages) // minutes
  }),

  updateMission: Joi.object({
    title: Joi.string().min(5).max(255).optional().messages(customMessages),
    description: Joi.string().min(10).max(1000).optional().messages(customMessages),
    status: Joi.string().valid('pending', 'accepted', 'refused', 'in_progress', 'completed', 'cancelled').optional().messages(customMessages),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional().messages(customMessages),
    estimated_duration: Joi.number().min(15).max(1440).optional().messages(customMessages)
  }),

  // Payment validation
  createPayment: Joi.object({
    expediteur_id: Joi.string().uuid().required().messages(customMessages),
    colis_id: Joi.string().uuid().required().messages(customMessages),
    commercial_id: Joi.string().uuid().optional().messages(customMessages),
    amount: Joi.number().min(0.01).max(100000).precision(2).required().messages(customMessages),
    payment_type: Joi.string().valid('cash', 'card', 'bank_transfer', 'mobile_money').default('cash').messages(customMessages),
    commission_amount: Joi.number().min(0).max(10000).precision(2).optional().messages(customMessages)
  }),

  updatePayment: Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').optional().messages(customMessages),
    commission_paid: Joi.boolean().optional().messages(customMessages),
    payment_date: Joi.date().optional().messages(customMessages)
  }),

  // Reclamation validation
  createReclamation: Joi.object({
    expediteur_id: Joi.string().uuid().required().messages(customMessages),
    colis_id: Joi.string().uuid().required().messages(customMessages),
    livreur_id: Joi.string().uuid().optional().messages(customMessages),
    subject: Joi.string().min(5).max(255).required().messages(customMessages),
    description: Joi.string().min(10).max(2000).required().messages(customMessages),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal').messages(customMessages)
  }),

  updateReclamation: Joi.object({
    status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional().messages(customMessages),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional().messages(customMessages),
    assigned_to: Joi.string().uuid().optional().messages(customMessages),
    resolution: Joi.string().min(10).max(2000).optional().messages(customMessages)
  }),

  // Sector validation
  createSecteur: Joi.object({
    name: Joi.string().min(2).max(100).required().messages(customMessages),
    description: Joi.string().min(5).max(500).optional().messages(customMessages),
    city: Joi.string().min(2).max(100).required().messages(customMessages),
    postal_codes: Joi.array().items(Joi.string().min(3).max(20)).min(1).required().messages(customMessages),
    is_active: Joi.boolean().default(true).messages(customMessages)
  }),

  updateSecteur: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages(customMessages),
    description: Joi.string().min(5).max(500).optional().messages(customMessages),
    city: Joi.string().min(2).max(100).optional().messages(customMessages),
    postal_codes: Joi.array().items(Joi.string().min(3).max(20)).min(1).optional().messages(customMessages),
    is_active: Joi.boolean().optional().messages(customMessages)
  }),

  // Entrepot validation
  createEntrepot: Joi.object({
    name: Joi.string().min(2).max(255).required().messages(customMessages),
    address: Joi.string().min(5).max(500).required().messages(customMessages),
    city: Joi.string().min(2).max(100).required().messages(customMessages),
    postal_code: Joi.string().min(3).max(20).required().messages(customMessages),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages(customMessages),
    email: Joi.string().email().required().messages(customMessages),
    manager_id: Joi.string().uuid().optional().messages(customMessages),
    capacity: Joi.number().min(1).max(100000).optional().messages(customMessages),
    is_active: Joi.boolean().default(true).messages(customMessages)
  }),

  updateEntrepot: Joi.object({
    name: Joi.string().min(2).max(255).optional().messages(customMessages),
    address: Joi.string().min(5).max(500).optional().messages(customMessages),
    city: Joi.string().min(2).max(100).optional().messages(customMessages),
    postal_code: Joi.string().min(3).max(20).optional().messages(customMessages),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages(customMessages),
    email: Joi.string().email().optional().messages(customMessages),
    manager_id: Joi.string().uuid().optional().messages(customMessages),
    capacity: Joi.number().min(1).max(100000).optional().messages(customMessages),
    is_active: Joi.boolean().optional().messages(customMessages)
  }),

  // Query parameters validation
  pagination: Joi.object({
    page: Joi.number().min(1).default(1).messages(customMessages),
    limit: Joi.number().min(1).max(100).default(10).messages(customMessages),
    sort: Joi.string().optional().messages(customMessages),
    order: Joi.string().valid('asc', 'desc').default('desc').messages(customMessages)
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).optional().messages(customMessages),
    status: Joi.string().optional().messages(customMessages),
    date_from: Joi.date().optional().messages(customMessages),
    date_to: Joi.date().optional().messages(customMessages)
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query parameters validation middleware
const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorDetails
      });
    }

    // Replace request query with validated and sanitized data
    req.query = value;
    next();
  };
};

// Specific validation functions for new routes
const validatePayment = (req, res, next) => {
  const schema = Joi.object({
    expediteur_id: Joi.string().uuid().required().messages(customMessages),
    montant: Joi.number().min(0.01).max(100000).precision(2).required().messages(customMessages),
    methode_paiement: Joi.string().valid('cash', 'card', 'bank_transfer', 'mobile_money').required().messages(customMessages),
    reference: Joi.string().min(3).max(100).optional().messages(customMessages)
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }

  req.body = value;
  next();
};

const validateReclamation = (req, res, next) => {
  const schema = Joi.object({
    colis_id: Joi.string().uuid().required().messages(customMessages),
    type_reclamation: Joi.string().valid('retard', 'dommage', 'perte', 'autre').required().messages(customMessages),
    description: Joi.string().min(10).max(2000).required().messages(customMessages),
    priorite: Joi.string().valid('basse', 'normale', 'haute', 'urgente').default('normale').messages(customMessages)
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }

  req.body = value;
  next();
};

const validateSecteur = (req, res, next) => {
  const schema = Joi.object({
    nom: Joi.string().min(2).max(100).required().messages(customMessages),
    description: Joi.string().min(5).max(500).optional().messages(customMessages),
    zone_geographique: Joi.string().min(5).max(500).optional().messages(customMessages)
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }

  req.body = value;
  next();
};

const validateEntrepot = (req, res, next) => {
  const schema = Joi.object({
    nom: Joi.string().min(2).max(255).required().messages(customMessages),
    adresse: Joi.string().min(5).max(500).required().messages(customMessages),
    ville: Joi.string().min(2).max(100).required().messages(customMessages),
    code_postal: Joi.string().min(3).max(20).required().messages(customMessages),
    telephone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages(customMessages),
    email: Joi.string().email().required().messages(customMessages),
    capacite: Joi.number().min(1).max(100000).optional().messages(customMessages)
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validate,
  validateQuery,
  validatePayment,
  validateReclamation,
  validateSecteur,
  validateEntrepot,
  schemas
}; 