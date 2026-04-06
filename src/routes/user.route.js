import { Router } from 'express';
import { 
    registerUser, 
    validateUserEmail, 
    loginUser, 
    refreshAccessToken, 
    logoutUser,
    updateUserOnboarding,
    updateCompanyOnboarding,
    uploadLogo,
    getUser,
    deleteUser,
    updatePassword
} from '../controllers/user.controller.js';
import { 
    registerUserSchema, 
    validateEmailCodeSchema, 
    loginUserSchema,
    refreshTokenSchema, 
    onboardingUserSchema,
    companyOnboardingSchema,
    updatePasswordSchema
} from '../validators/user.validator.js';
import { validate, validateBody } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import uploadMiddleware from '../middleware/upload.middleware.js';
import { checkUserHasCompany } from '../middleware/company.middleware.js';


const router = Router();

// POST /api/user/register
router.post('/register', validateBody(registerUserSchema), registerUser);
// PUT /api/user/validation
router.put('/validation', authMiddleware, validate(validateEmailCodeSchema), validateUserEmail);
// POST /api/user/login
router.post('/login', validateBody(loginUserSchema), loginUser);
// POST /api/user/refresh
router.post('/refresh', validateBody(refreshTokenSchema), refreshAccessToken);
// POST /api/user/logout
router.post('/logout', authMiddleware, validateBody(refreshTokenSchema), logoutUser);
// PUT /api/user/register
router.put('/register', authMiddleware, validateBody(onboardingUserSchema), updateUserOnboarding);
// PATCH /api/user/company
router.patch('/company', authMiddleware, validateBody(companyOnboardingSchema), updateCompanyOnboarding);
// PATCH /api/user/logo
router.patch('/logo', authMiddleware, checkUserHasCompany,uploadMiddleware.single('logo'), uploadLogo);
// GET /api/user
router.get('/', authMiddleware, getUser);
// DELETE /api/user
router.delete('/', authMiddleware, deleteUser);
// PUT /api/user/password
router.put('/password', authMiddleware, validateBody(updatePasswordSchema), updatePassword);

export default router;