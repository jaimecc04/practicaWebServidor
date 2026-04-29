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
    updatePassword,
    inviteUser
} from '../controllers/user.controller.js';
import { 
    registerUserSchema, 
    validateEmailCodeSchema, 
    loginUserSchema,
    refreshTokenSchema, 
    onboardingUserSchema,
    companyOnboardingSchema,
    updatePasswordSchema,
    inviteUserSchema
} from '../validators/user.validator.js';
import { validate, validateBody } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import uploadMiddleware from '../middleware/upload.middleware.js';
import { checkUserHasCompany } from '../middleware/company.middleware.js';


const router = Router();

router.post('/register', validateBody(registerUserSchema), registerUser);
router.put('/validation', authMiddleware, validate(validateEmailCodeSchema), validateUserEmail);
router.post('/login', validateBody(loginUserSchema), loginUser);
router.post('/refresh', validateBody(refreshTokenSchema), refreshAccessToken);
router.post('/logout', authMiddleware, validateBody(refreshTokenSchema), logoutUser);
router.put('/register', authMiddleware, validateBody(onboardingUserSchema), updateUserOnboarding);
router.patch('/company', authMiddleware, validateBody(companyOnboardingSchema), updateCompanyOnboarding);
router.patch('/logo', authMiddleware, checkUserHasCompany,uploadMiddleware.single('logo'), uploadLogo);
router.get('/', authMiddleware, getUser);
router.delete('/', authMiddleware, deleteUser);
router.put('/password', authMiddleware, validateBody(updatePasswordSchema), updatePassword);
router.post('/invite', authMiddleware, validateBody(inviteUserSchema), inviteUser);

export default router;
