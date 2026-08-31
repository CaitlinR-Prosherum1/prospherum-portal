# Prospherum Learner Application Portal
## Functional Requirements

### 1. Purpose

The Prospherum Learner Application Portal will provide a public application interface through which prospective learners can submit their personal information, qualifications, CVs and supporting documents for consideration for Prospherum training and development opportunities.

The system must be capable of operating independently of the original developer after handover.

### 2. Public Learner Access

Learners do not require an account to submit an application.

Learners may access the application through:
- The Prospherum website
- A direct application URL

The public interface must provide:
- Information about Prospherum
- Available application opportunities
- Application form
- Document upload
- Submission confirmation
- Unique application reference number
- Email confirmation

### 3. Application Information

Applications may contain:
- Personal information
- Contact information
- Location information
- Educational qualifications
- Skills and computer literacy
- Opportunity/programme selection
- CV
- Identification documents
- Qualification certificates
- Supporting documentation

Document requirements should support future configuration per opportunity.

### 4. Application Reference

Each successfully submitted application must receive a unique human-readable reference number.

Proposed format:

PRS-YYYY-NNNNNN

### 5. Application Statuses

Initial supported statuses:

- Submitted
- Incomplete
- Under Review
- On Hold
- Shortlisted
- Selected
- Rejected
- Withdrawn
- Completed
- Archived

### 6. Screening

The first production version must not depend on artificial intelligence.

Basic eligibility and document checks will be performed using configurable rules.

AI may be added later as an optional recommendation or analysis service.

### 7. Staff Access

Staff members are the only users who require authentication.

Staff access will be provided through:

/staff/login

Staff functionality will include:
- Application management
- Application search
- Document retrieval
- Screening
- Shortlisting
- Selection
- Rejection
- Notes
- Archive management
- Reporting
- Audit history

### 8. Staff Roles

The initial role model will support:

Administrator:
Full system administration.

Manager:
Application management, selection oversight and reporting.

Reviewer:
Application review, document access, shortlisting and rejection.

Final permissions will be confirmed with Prospherum before production deployment.

### 9. Rejected Applications

Rejected applications must be retained in a controlled rejected area rather than immediately deleted.

The system should record:
- Rejection reason
- Rejected by
- Rejection date

Permanent deletion should be a separate controlled administrative operation subject to Prospherum's retention policy.

### 10. Archiving

Applications should support logical archival using timestamps and status information.

Staff should be able to browse archives by:
- Recent
- Week
- Month
- Year
- Older records

The system should avoid unnecessary physical movement of records between databases or storage locations.

### 11. Audit Trail

Important system and staff actions must be recorded.

Examples include:
- Application viewed
- Document accessed
- Status changed
- Application shortlisted
- Application rejected
- Application selected
- Note added
- Document uploaded
- Document deleted
- Staff account created
- Staff permission changed

### 12. Notifications

The architecture should support:
- Email notifications
- Website status notifications
- Future WhatsApp notifications

Email will be implemented before WhatsApp unless Prospherum specifies otherwise.

### 13. Learner Status Checking

A future public status-checking interface should allow learners to retrieve application status using their reference number and appropriate verification information.

Learners should not require a full user account.

### 14. Operational Independence

The production system must not depend on the personal accounts, local computer, development environment or infrastructure of the original developer.

Production services must be owned and controlled by Prospherum or an account designated by Prospherum.

### 15. Data Storage

Application data will be stored in a managed production database.

Uploaded documents will be stored using managed object/file storage, with database records containing document metadata and references.

### 16. Branding

The portal must use the established Prospherum visual identity and supplied Prospherum branding assets.

### 17. Future Expansion

The architecture should allow future implementation of:
- AI-assisted CV analysis
- Advanced reporting
- WhatsApp notifications
- Additional training opportunities
- Automated screening
- Additional staff roles
- Learner status tracking
- Applicant communication history
