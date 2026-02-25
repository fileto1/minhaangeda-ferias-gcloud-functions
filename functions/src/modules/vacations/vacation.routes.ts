import { Router } from 'express';
import { VacationsController } from './vacations.controller';
// import { authMiddleware } from '../../middlewares/auth.middleware';

const controller = new VacationsController();
export const vacationsRoutes = Router();

// vacationsRoutes.use(authMiddleware);

vacationsRoutes.get('/pending', controller.getAllPending);
vacationsRoutes.get('/:id', controller.getById);
vacationsRoutes.get('/byEmployee/:employeeId', controller.getAllByEmployeeId);
vacationsRoutes.get('/allEmployeesBalance', controller.getAllEmployeesBalance);
vacationsRoutes.get('/calendar', controller.getCalendar);

vacationsRoutes.post('/', controller.create);
vacationsRoutes.put('/:id', controller.update);
vacationsRoutes.put('/status/:status/:id', controller.updateStatus);
vacationsRoutes.delete('/:id', controller.delete);