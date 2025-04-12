-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS usage_instructions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS disease_types CASCADE;
DROP TABLE IF EXISTS appointment_lists CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Tạo function cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Bảng cài đặt hệ thống
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bệnh nhân
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Nam', 'Nu', 'Khac')),
    birth_year INTEGER CHECK (birth_year > 1900),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đăng ký khám
CREATE TABLE appointment_lists (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    order_number INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (appointment_date, order_number)
);

-- Bảng loại bệnh
CREATE TABLE disease_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng vai trò
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhân viên
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phiếu khám bệnh
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE RESTRICT,
    staff_id INTEGER REFERENCES staff(id) ON DELETE RESTRICT,
    examination_date DATE NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    disease_type_id INTEGER REFERENCES disease_types(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thuốc
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity_in_stock INTEGER NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hướng dẫn sử dụng thuốc
CREATE TABLE usage_instructions (
    id SERIAL PRIMARY KEY,
    instruction TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đơn thuốc
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER REFERENCES medical_records(id) ON DELETE RESTRICT,
    medicine_id INTEGER REFERENCES medicines(id) ON DELETE RESTRICT,
    staff_id INTEGER REFERENCES staff(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    usage_instruction_id INTEGER REFERENCES usage_instructions(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hóa đơn
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER REFERENCES medical_records(id) ON DELETE RESTRICT,
    staff_id INTEGER REFERENCES staff(id) ON DELETE RESTRICT,
    examination_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (examination_fee >= 0),
    medicine_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (medicine_fee >= 0),
    total_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_fee >= 0),
    payment_date TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng quyền hạn
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phân quyền cho vai trò
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Tạo các trigger cập nhật updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_lists_updated_at
    BEFORE UPDATE ON appointment_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_types_updated_at
    BEFORE UPDATE ON disease_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
    BEFORE UPDATE ON medicines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_instructions_updated_at
    BEFORE UPDATE ON usage_instructions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tạo các index
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointment_lists_date ON appointment_lists(appointment_date);
CREATE INDEX idx_medical_records_date ON medical_records(examination_date);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_prescriptions_medical_record ON prescriptions(medical_record_id);
CREATE INDEX idx_invoices_medical_record ON invoices(medical_record_id);
CREATE INDEX idx_invoices_date ON invoices(payment_date);
CREATE INDEX idx_staff_username ON staff(username);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role_id);

-- Thêm dữ liệu mẫu cho cài đặt
INSERT INTO settings (key, value, description) VALUES
('max_appointments_per_day', '40', 'So luong benh nhan toi da moi ngay'),
('examination_fee', '100000', 'Phi kham benh mac dinh');

-- Thêm dữ liệu mẫu cho bảng roles
INSERT INTO roles (name, description) VALUES
('admin', 'Quan tri vien he thong'),
('doctor', 'Bac si'),
('nurse', 'Y ta'),
('receptionist', 'Le tan'),
('pharmacist', 'Duoc si');

-- Thêm dữ liệu mẫu cho bảng permissions
INSERT INTO permissions (name, description) VALUES
('manage_staff', 'Quan ly nhan vien'),
('manage_patients', 'Quan ly benh nhan'),
('manage_appointments', 'Quan ly lich hen'),
('manage_medical_records', 'Quan ly ho so benh an'),
('manage_medicines', 'Quan ly thuoc'),
('manage_prescriptions', 'Quan ly don thuoc'),
('manage_invoices', 'Quan ly hoa don'),
('view_reports', 'Xem bao cao thong ke');

-- Thêm dữ liệu mẫu cho bảng role_permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'doctor' AND p.name IN ('manage_patients', 'manage_medical_records', 'manage_prescriptions', 'view_reports');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'nurse' AND p.name IN ('manage_patients', 'manage_appointments', 'view_reports');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'receptionist' AND p.name IN ('manage_patients', 'manage_appointments', 'manage_invoices');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'pharmacist' AND p.name IN ('manage_medicines', 'manage_prescriptions');

-- Thêm dữ liệu mẫu cho bảng staff
INSERT INTO staff (username, password_hash, full_name, email, phone, role_id) VALUES
('admin', '$2b$10$TAHYyGWLyd1IVXbXmTWL2uK3mSGnq.dHeg0s0la/dMIZ06wH2/pw6', 'Admin', 'admin@clinic.com', '0123456789', (SELECT id FROM roles WHERE name = 'admin')),
('doctor1', '$2b$10$TAHYyGWLyd1IVXbXmTWL2uK3mSGnq.dHeg0s0la/dMIZ06wH2/pw6', 'Bac si Nguyen Van A', 'doctor1@clinic.com', '0123456790', (SELECT id FROM roles WHERE name = 'doctor')),
('nurse1', '$2b$10$TAHYyGWLyd1IVXbXmTWL2uK3mSGnq.dHeg0s0la/dMIZ06wH2/pw6', 'Y ta Tran Thi B', 'nurse1@clinic.com', '0123456791', (SELECT id FROM roles WHERE name = 'nurse')),
('receptionist1', '$2b$10$TAHYyGWLyd1IVXbXmTWL2uK3mSGnq.dHeg0s0la/dMIZ06wH2/pw6', 'Le tan Pham Thi C', 'receptionist1@clinic.com', '0123456792', (SELECT id FROM roles WHERE name = 'receptionist')),
('pharmacist1', '$2b$10$TAHYyGWLyd1IVXbXmTWL2uK3mSGnq.dHeg0s0la/dMIZ06wH2/pw6', 'Duoc si Le Van D', 'pharmacist1@clinic.com', '0123456793', (SELECT id FROM roles WHERE name = 'pharmacist'));

-- Thêm dữ liệu mẫu cho bảng disease_types
INSERT INTO disease_types (name, description) VALUES
('Cam cum', 'Cac trieu chung cam cum thong thuong'),
('Viem hong', 'Viem nhiem duong ho hap tren'),
('Dau da day', 'Cac benh ly ve da day'),
('Tang huyet ap', 'Benh ly ve huyet ap cao'),
('Tieu duong', 'Benh ly ve duong huyet');

-- Thêm dữ liệu mẫu cho bảng patients
INSERT INTO patients (full_name, gender, birth_year, phone, address) VALUES
('Nguyen Van X', 'Nam', 1980, '0987654321', 'So 1, Duong A, Quan 1, TP.HCM'),
('Tran Thi Y', 'Nu', 1990, '0987654322', 'So 2, Duong B, Quan 2, TP.HCM'),
('Pham Van Z', 'Nam', 1985, '0987654323', 'So 3, Duong C, Quan 3, TP.HCM'),
('Le Thi W', 'Nu', 1995, '0987654324', 'So 4, Duong D, Quan 4, TP.HCM');

-- Thêm dữ liệu mẫu cho bảng medicines
INSERT INTO medicines (name, unit, price, quantity_in_stock, description) VALUES
('Paracetamol', 'Vien', 2000, 1000, 'Thuoc ha sot, giam dau'),
('Amoxicillin', 'Vien', 5000, 500, 'Khang sinh'),
('Omeprazole', 'Vien', 3000, 800, 'Thuoc da day'),
('Vitamin C', 'Vien', 1000, 2000, 'Bo sung vitamin C'),
('Amlodipine', 'Vien', 4000, 600, 'Thuoc huyet ap');

-- Thêm dữ liệu mẫu cho bảng usage_instructions
INSERT INTO usage_instructions (instruction, description) VALUES
('Ngay uong 2 lan, sang - chieu, sau an', 'Uong sau khi an 30 phut'),
('Ngay uong 3 lan, sang - trua - toi, sau an', 'Uong sau khi an 30 phut'),
('Ngay uong 1 lan, sang sau an', 'Uong vao buoi sang sau an'),
('Ngay uong 1 lan, toi truoc khi ngu', 'Uong truoc khi di ngu 30 phut');

-- Thêm dữ liệu mẫu cho bảng appointment_lists
INSERT INTO appointment_lists (patient_id, appointment_date, order_number, status, notes) VALUES
(1, CURRENT_DATE, 1, 'completed', 'Kham dinh ky'),
(2, CURRENT_DATE, 2, 'completed', 'Tai kham'),
(3, CURRENT_DATE + INTERVAL '1 day', 1, 'waiting', 'Kham lan dau'),
(4, CURRENT_DATE + INTERVAL '1 day', 2, 'waiting', 'Kham theo yeu cau');

-- Thêm dữ liệu mẫu cho bảng medical_records
INSERT INTO medical_records (patient_id, staff_id, examination_date, symptoms, diagnosis, disease_type_id, notes) VALUES
(1, 2, CURRENT_DATE, 'Sot, dau dau, so mui', 'Cam cum thong thuong', 1, 'Can nghi ngoi, uong nhieu nuoc'),
(2, 2, CURRENT_DATE, 'Dau hong, kho nuot', 'Viem hong cap', 2, 'Can kieng do lanh');

-- Thêm dữ liệu mẫu cho bảng prescriptions
INSERT INTO prescriptions (medical_record_id, medicine_id, staff_id, quantity, usage_instruction_id, notes) VALUES
(1, 1, 2, 10, 1, 'Uong khi sot tren 38.5 do'),
(1, 4, 2, 20, 2, 'Tang suc de khang'),
(2, 2, 2, 15, 2, 'Uong du lieu'),
(2, 4, 2, 10, 1, 'Tang suc de khang');

-- Thêm dữ liệu mẫu cho bảng invoices
INSERT INTO invoices (medical_record_id, staff_id, examination_fee, medicine_fee, total_fee, payment_date, status, notes) VALUES
(1, 4, 100000, 60000, 160000, CURRENT_TIMESTAMP, 'paid', 'Da thanh toan day du'),
(2, 4, 100000, 90000, 190000, CURRENT_TIMESTAMP, 'paid', 'Da thanh toan day du');
