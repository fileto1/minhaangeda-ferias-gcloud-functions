"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const employee_service_1 = require("./employee.service");
class EmployeesController {
    constructor() {
        this.employeesService = new employee_service_1.EmployeesService();
    }
    /**
     * GET /employees/:id
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            // equivalente ao Authentication authentication
            const principal = req.user; // vindo do authMiddleware
            // if (!principal) {
            //   return res.status(401).json({ message: "Unauthorized" });
            // }
            const employee = await this.employeesService.findById(id, principal);
            return res.status(200).json(employee);
        }
        catch (error) {
            return res.status(500).json({
                message: "Error fetching employee",
                error: error.message,
            });
        }
    }
}
exports.EmployeesController = EmployeesController;
//# sourceMappingURL=employee.controller.js.map