const pool = require('../config/db');

const auditLogger = {
  async log(action, entityType, entityId, oldValue, newValue, userId, ipAddress) {
    try {
      await pool.query(
        `INSERT INTO audit_logs 
         (action, entity_type, entity_id, old_value, new_value, user_id, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          action,
          entityType,
          entityId,
          oldValue ? JSON.stringify(oldValue) : null,
          newValue ? JSON.stringify(newValue) : null,
          userId,
          ipAddress
        ]
      );
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  },

  // Helper methods for common actions
  async logUserUpdate(userId, oldValue, newValue, adminId, ipAddress) {
    await this.log('UPDATE', 'user', userId, oldValue, newValue, adminId, ipAddress);
  },

  async logUserSuspension(userId, suspended, adminId, ipAddress) {
    await this.log(
      'UPDATE',
      'user',
      userId,
      { is_suspended: !suspended },
      { is_suspended: suspended },
      adminId,
      ipAddress
    );
  },

  async logEmployerApproval(userId, approved, adminId, ipAddress) {
    await this.log(
      'UPDATE',
      'employer',
      userId,
      { isApproved: !approved },
      { isApproved: approved },
      adminId,
      ipAddress
    );
  }
};

module.exports = auditLogger; 