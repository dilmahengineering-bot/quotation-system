const db = require('../config/database');

// Status transition rules
const STATUS_TRANSITIONS = {
  'Draft': ['Submitted'],
  'Submitted': ['Engineer Approved', 'Rejected'],
  'Engineer Approved': ['Management Approved', 'Rejected'],
  'Management Approved': ['Issued', 'Rejected'],
  'Rejected': ['Draft'],
  'Issued': []
};

// Check if status transition is valid
function isValidTransition(currentStatus, newStatus) {
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

// Submit quotation for approval
exports.submitQuotation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { comments } = req.body;

    // Get current status
    const checkResult = await client.query(
      'SELECT status, quote_number FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    
    if (!isValidTransition(currentStatus, 'Submitted')) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot submit quotation from ${currentStatus} status`
      });
    }

    // Check if quotation has parts
    const partsCheck = await client.query(
      'SELECT COUNT(*) FROM quotation_parts WHERE quotation_id = $1',
      [id]
    );

    if (parseInt(partsCheck.rows[0].count) === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot submit quotation without parts'
      });
    }

    // Update status
    await client.query(
      'UPDATE quotations SET status = $1, updated_by = $2 WHERE quotation_id = $3',
      ['Submitted', req.user.userId, id]
    );

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, old_status, new_status, performed_by, comments)
      VALUES ($1, 'Submitted', $2, 'Submitted', $3, $4)
    `, [id, currentStatus, req.user.userId, comments || 'Submitted for approval']);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation submitted for approval'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Engineer approval
exports.engineerApprove = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { comments } = req.body;

    // Get current status
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    
    if (!isValidTransition(currentStatus, 'Engineer Approved')) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot approve quotation from ${currentStatus} status`
      });
    }

    // Update status
    await client.query(
      'UPDATE quotations SET status = $1, updated_by = $2 WHERE quotation_id = $3',
      ['Engineer Approved', req.user.userId, id]
    );

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, old_status, new_status, performed_by, comments)
      VALUES ($1, 'Engineer Approved', $2, 'Engineer Approved', $3, $4)
    `, [id, currentStatus, req.user.userId, comments || 'Approved by engineer']);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation approved by engineer'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Management approval
exports.managementApprove = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { comments } = req.body;

    // Get current status
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    
    if (!isValidTransition(currentStatus, 'Management Approved')) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot approve quotation from ${currentStatus} status`
      });
    }

    // Update status
    await client.query(
      'UPDATE quotations SET status = $1, updated_by = $2 WHERE quotation_id = $3',
      ['Management Approved', req.user.userId, id]
    );

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, old_status, new_status, performed_by, comments)
      VALUES ($1, 'Management Approved', $2, 'Management Approved', $3, $4)
    `, [id, currentStatus, req.user.userId, comments || 'Approved by management']);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation approved by management'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Reject quotation
exports.rejectQuotation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get current status
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    
    if (!isValidTransition(currentStatus, 'Rejected')) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot reject quotation from ${currentStatus} status`
      });
    }

    // Update status
    await client.query(
      'UPDATE quotations SET status = $1, updated_by = $2 WHERE quotation_id = $3',
      ['Rejected', req.user.userId, id]
    );

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, old_status, new_status, performed_by, comments)
      VALUES ($1, 'Rejected', $2, 'Rejected', $3, $4)
    `, [id, currentStatus, req.user.userId, comments]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation rejected'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Issue quotation (final step)
exports.issueQuotation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { comments } = req.body;

    // Get current status
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    
    if (!isValidTransition(currentStatus, 'Issued')) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot issue quotation from ${currentStatus} status`
      });
    }

    // Update status
    await client.query(
      'UPDATE quotations SET status = $1, updated_by = $2 WHERE quotation_id = $3',
      ['Issued', req.user.userId, id]
    );

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, old_status, new_status, performed_by, comments)
      VALUES ($1, 'Issued', $2, 'Issued', $3, $4)
    `, [id, currentStatus, req.user.userId, comments || 'Quotation issued to customer']);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation issued successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Revert rejected quotation to draft
exports.revertToDraft = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { comments } = req.body;

    // Get current status
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    
    if (!isValidTransition(currentStatus, 'Draft')) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot revert quotation from ${currentStatus} status`
      });
    }

    // Update status
    await client.query(
      'UPDATE quotations SET status = $1, updated_by = $2 WHERE quotation_id = $3',
      ['Draft', req.user.userId, id]
    );

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, old_status, new_status, performed_by, comments)
      VALUES ($1, 'Reverted to Draft', $2, 'Draft', $3, $4)
    `, [id, currentStatus, req.user.userId, comments || 'Reverted to draft for revision']);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation reverted to draft'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Delete quotation (only drafts)
exports.deleteQuotation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Get current status
    const checkResult = await client.query(
      'SELECT status, quote_number FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (checkResult.rows[0].status !== 'Draft') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Only draft quotations can be deleted'
      });
    }

    // Delete quotation (cascade will delete parts, operations, aux costs, and audit log)
    await client.query('DELETE FROM quotations WHERE quotation_id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Get quotation statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Draft') as draft,
        COUNT(*) FILTER (WHERE status = 'Submitted') as submitted,
        COUNT(*) FILTER (WHERE status = 'Engineer Approved') as engineer_approved,
        COUNT(*) FILTER (WHERE status = 'Management Approved') as management_approved,
        COUNT(*) FILTER (WHERE status = 'Issued') as issued,
        COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
        COALESCE(SUM(total_quote_value) FILTER (WHERE status = 'Issued'), 0) as total_issued_value
      FROM quotations
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
