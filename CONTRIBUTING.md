# Contributing to Quotation Management System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 14+
- PostgreSQL 12+
- Git
- Code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/quotation-system.git
   cd quotation-system
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up database**
   ```bash
   createdb quotation_db_dev
   psql -d quotation_db_dev -f backend/database/schema.sql
   ```

4. **Configure environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit .env with your database credentials
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Development Workflow

### Branch Naming

- Feature: `feature/description`
- Bug fix: `bugfix/description`
- Hot fix: `hotfix/description`
- Refactor: `refactor/description`

Examples:
- `feature/pdf-export`
- `bugfix/calculation-error`
- `hotfix/security-patch`

### Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(quotations): add PDF export functionality

Added ability to export quotations as PDF files
using jsPDF library. Includes custom styling and
company logo support.

Closes #123
```

```
fix(calculations): correct VAT calculation logic

VAT was being applied before margin instead of after.
Fixed calculation order to match specification.

Fixes #456
```

## Coding Standards

### Backend (Node.js)

**File Structure:**
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
└── tests/          # Test files
```

**Naming Conventions:**
- Files: camelCase (e.g., `machineController.js`)
- Classes: PascalCase (e.g., `Machine`)
- Functions: camelCase (e.g., `calculateTotal`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)

**Best Practices:**
- Use async/await for asynchronous operations
- Always use try/catch for error handling
- Use proper HTTP status codes
- Add JSDoc comments for functions
- Validate input data
- Use parameterized queries (prevent SQL injection)

**Example:**
```javascript
/**
 * Get all active machines
 * @returns {Promise<Array>} Array of machine objects
 */
static async getAll() {
  try {
    const query = 'SELECT * FROM machines WHERE is_active = true ORDER BY machine_name';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch machines: ${error.message}`);
  }
}
```

### Frontend (React)

**File Structure:**
```
frontend/src/
├── components/      # React components
│   ├── Common/     # Reusable components
│   ├── Machines/   # Machine-related components
│   ├── Customers/  # Customer-related components
│   └── ...
├── services/       # API services
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
└── styles/         # CSS files
```

**Naming Conventions:**
- Components: PascalCase (e.g., `MachineList.js`)
- Files: Same as component name
- Props: camelCase
- State variables: camelCase

**Best Practices:**
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use PropTypes or TypeScript for type checking
- Handle loading and error states
- Avoid inline styling (use CSS classes)

**Example:**
```javascript
import React, { useState, useEffect } from 'react';
import { machineAPI } from '../../services/api';

/**
 * MachineList Component
 * Displays a list of all machines with CRUD operations
 */
function MachineList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await machineAPI.getAll();
      setMachines(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="machine-list">
      {/* Component JSX */}
    </div>
  );
}

export default MachineList;
```

### Database

**SQL Standards:**
- Use lowercase for SQL keywords
- Use snake_case for table and column names
- Always add indexes for foreign keys
- Use proper data types
- Add comments for complex queries

**Example:**
```sql
-- Create machine table with proper constraints
CREATE TABLE IF NOT EXISTS machines (
    machine_id SERIAL PRIMARY KEY,
    machine_name VARCHAR(255) NOT NULL UNIQUE,
    machine_type VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX idx_machines_active ON machines(is_active);

-- Add comment
COMMENT ON TABLE machines IS 'Stores CNC machine information and hourly rates';
```

### CSS

**Standards:**
- Use BEM naming convention
- Group related styles
- Use CSS variables for colors and spacing
- Mobile-first approach
- Avoid !important

**Example:**
```css
/* Machine List Component */
.machine-list {
  padding: 1rem;
  background-color: var(--bg-color);
}

.machine-list__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.machine-list__item {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.machine-list__item:hover {
  background-color: var(--hover-color);
}
```

## Testing

### Backend Tests

We use Jest for backend testing:

```javascript
// tests/machine.test.js
const Machine = require('../models/Machine');

describe('Machine Model', () => {
  test('should create a new machine', async () => {
    const machineData = {
      machine_name: 'Test Mill',
      machine_type: 'Milling',
      hourly_rate: 80.00
    };
    
    const machine = await Machine.create(machineData);
    expect(machine.machine_name).toBe('Test Mill');
    expect(machine.hourly_rate).toBe('80.00');
  });

  test('should fetch all active machines', async () => {
    const machines = await Machine.getAll();
    expect(Array.isArray(machines)).toBe(true);
    expect(machines.every(m => m.is_active)).toBe(true);
  });
});
```

Run tests:
```bash
cd backend
npm test
```

### Frontend Tests

We use React Testing Library:

```javascript
// components/Machines/MachineList.test.js
import { render, screen, waitFor } from '@testing-library/react';
import MachineList from './MachineList';

test('renders machine list', async () => {
  render(<MachineList />);
  
  await waitFor(() => {
    expect(screen.getByText(/machines/i)).toBeInTheDocument();
  });
});
```

Run tests:
```bash
cd frontend
npm test
```

## Submitting Changes

### Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests for new features
   - Update documentation

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 10]
- Node version: [e.g., 18.0.0]
- Browser: [e.g., Chrome 120]

**Additional context**
Any other relevant information.
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution**
What you want to happen.

**Describe alternatives**
Alternative solutions you've considered.

**Additional context**
Any other relevant information, mockups, etc.
```

## Documentation

When adding features, update:
- README.md
- API_DOCUMENTATION.md
- CHANGELOG.md
- Inline code comments
- JSDoc/TSDoc comments

## Questions?

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

---

**Thank you for contributing to making this project better!** 🎉
