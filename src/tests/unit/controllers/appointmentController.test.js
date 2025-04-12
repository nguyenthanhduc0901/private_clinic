/**
 * Unit tests cho Appointment Controller
 */
const { expect } = require('chai');
const sinon = require('sinon');
const { StatusCodes } = require('http-status-codes');
const appointmentController = require('../../../controllers/appointmentController');
const AppointmentService = require('../../../services/AppointmentService');
const ApiError = require('../../../utils/ApiError');

describe('Appointment Controller', () => {
  let req, res, next, sandbox;

  beforeEach(() => {
    // Thiết lập sandbox cho mỗi test case
    sandbox = sinon.createSandbox();
    
    // Mock request, response và next function
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub()
    };
    
    next = sandbox.stub();
  });

  afterEach(() => {
    // Khôi phục tất cả stubs và mocks sau mỗi test
    sandbox.restore();
  });

  describe('getAppointments', () => {
    it('nên trả về danh sách cuộc hẹn khi gọi thành công', async () => {
      // Arrange
      const mockAppointments = {
        data: [
          { id: 1, patient_name: 'Nguyễn Văn A', date: '2023-05-01' },
          { id: 2, patient_name: 'Trần Thị B', date: '2023-05-02' }
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
      
      req.query = {
        page: 1,
        limit: 10
      };
      
      const searchAppointmentsStub = sandbox.stub(AppointmentService, 'searchAppointments')
        .resolves(mockAppointments);
      
      // Act
      await appointmentController.getAppointments(req, res, next);
      
      // Assert
      expect(searchAppointmentsStub.calledOnce).to.be.true;
      expect(res.status.calledWith(StatusCodes.OK)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        data: mockAppointments.data,
        pagination: mockAppointments.pagination
      })).to.be.true;
    });

    it('nên xử lý lỗi và gọi next() khi có lỗi', async () => {
      // Arrange
      const error = new Error('Lỗi khi tìm kiếm cuộc hẹn');
      
      sandbox.stub(AppointmentService, 'searchAppointments').rejects(error);
      
      // Act
      await appointmentController.getAppointments(req, res, next);
      
      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('getAppointmentById', () => {
    it('nên trả về thông tin cuộc hẹn khi tìm thấy', async () => {
      // Arrange
      const mockAppointment = {
        id: 1,
        patient_name: 'Nguyễn Văn A',
        date: '2023-05-01',
        status: 'CONFIRMED'
      };
      
      req.params = { id: 1 };
      
      sandbox.stub(AppointmentService, 'getAppointmentById').resolves(mockAppointment);
      
      // Act
      await appointmentController.getAppointmentById(req, res, next);
      
      // Assert
      expect(res.status.calledWith(StatusCodes.OK)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        data: mockAppointment
      })).to.be.true;
    });

    it('nên trả về lỗi 404 khi không tìm thấy cuộc hẹn', async () => {
      // Arrange
      req.params = { id: 999 };
      
      sandbox.stub(AppointmentService, 'getAppointmentById').resolves(null);
      
      // Act
      await appointmentController.getAppointmentById(req, res, next);
      
      // Assert
      expect(next.calledOnce).to.be.true;
      const error = next.firstCall.args[0];
      expect(error).to.be.instanceOf(ApiError);
      expect(error.statusCode).to.equal(StatusCodes.NOT_FOUND);
      expect(error.message).to.equal('Không tìm thấy cuộc hẹn');
    });
  });

  describe('createAppointment', () => {
    it('nên tạo cuộc hẹn mới thành công', async () => {
      // Arrange
      const appointmentData = {
        patient_id: 1,
        date: '2023-05-01',
        time_slot: '09:00-09:30',
        reason: 'Khám định kỳ'
      };
      
      const createdAppointment = {
        id: 1,
        ...appointmentData,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };
      
      req.body = appointmentData;
      
      sandbox.stub(AppointmentService, 'createAppointment').resolves(createdAppointment);
      
      // Act
      await appointmentController.createAppointment(req, res, next);
      
      // Assert
      expect(res.status.calledWith(StatusCodes.CREATED)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        message: 'Tạo cuộc hẹn thành công',
        data: createdAppointment
      })).to.be.true;
    });
  });

  // Thêm các test case cho các phương thức còn lại
}); 