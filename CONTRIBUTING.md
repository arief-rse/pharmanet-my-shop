# Contributing to PharmaNet E-Commerce Platform

Thank you for your interest in contributing to PharmaNet! This document provides guidelines and information for contributors.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Submitting Changes](#submitting-changes)
8. [Review Process](#review-process)
9. [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of:

- Age
- Body size
- Disability
- Ethnicity
- Gender identity and expression
- Level of experience
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable Behavior:**
- Harassment, sexual or otherwise
- Trolling, insulting/derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Any other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before you start contributing, ensure you have:

1. **Node.js 18+** installed
2. **Git** configured with your name and email
3. **GitHub account**
4. **Supabase account** (for testing backend features)
5. **Code editor** (VS Code recommended with extensions)

### VS Code Extensions (Recommended)

- **ESLint** - For code linting
- **Prettier** - For code formatting
- **TypeScript Importer** - For auto imports
- **Tailwind CSS IntelliSense** - For Tailwind support
- **Supabase** - For Supabase integration

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork locally
   git clone https://github.com/YOUR_USERNAME/pharmanet-my-shop.git
   cd pharmanet-my-shop
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/pharmanet-my-shop.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Create Environment File**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

All changes should be made on a feature branch:

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/issue-number` - Bug fixes
- `docs/update-name` - Documentation updates
- `refactor/component-name` - Code refactoring
- `test/component-name` - Adding tests
- `chore/task-description` - Maintenance tasks

### 2. Make Changes

- Write clean, commented code
- Follow the coding standards below
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Changes

Follow our commit message format:

```bash
# Format: type(scope): description
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(cart): resolve cart total calculation issue"
git commit -m "docs(readme): update installation instructions"
```

#### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

#### Commit Message Guidelines

- Use imperative mood ("add" not "added" or "adds")
- Keep first line under 50 characters
- Capitalize subject line
- Do not end subject line with a period
- Reference issue numbers when applicable: `fix(#123)`

### 4. Sync with Upstream

Before creating a pull request:

```bash
# Fetch latest changes
git fetch upstream

# Merge upstream changes into your branch
git rebase upstream/main

# Or merge
git merge upstream/main
```

### 5. Create Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request:
   - Use descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots if UI changes

## Coding Standards

### TypeScript

1. **Use TypeScript for all new code**
   ```typescript
   // Good
   interface User {
     id: string;
     email: string;
     role: UserRole;
   }

   // Bad
   const user = {
     id: '123',
     email: 'user@example.com',
     role: 'admin'
   };
   ```

2. **Prefer interfaces over types for objects**
   ```typescript
   // Good
   interface Product {
     name: string;
     price: number;
   }

   // OK (for unions)
   type Status = 'pending' | 'approved' | 'rejected';
   ```

3. **Use explicit return types**
   ```typescript
   // Good
   function calculateTotal(items: CartItem[]): number {
     return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
   }

   // Bad (implicit return type)
   function calculateTotal(items) {
     return items.reduce(...);
   }
   ```

### React

1. **Use functional components with hooks**
   ```typescript
   // Good
   const ProductCard = ({ product }: ProductCardProps) => {
     const [isAdded, setIsAdded] = useState(false);
     // ...
   };

   // Bad (class components)
   class ProductCard extends Component {
     // ...
   }
   ```

2. **Destructure props**
   ```typescript
   // Good
   const Button = ({ children, onClick, variant }: ButtonProps) => {
     return <button onClick={onClick} className={variant}>{children}</button>;
   };

   // Bad
   const Button = (props) => {
     return <button onClick={props.onClick} className={props.variant}>{props.children}</button>;
   };
   ```

3. **Use custom hooks for logic**
   ```typescript
   // Good
   const useCart = () => {
     const [items, setItems] = useState<CartItem[]>([]);
     // ...
     return { items, addToCart, removeFromCart };
   };

   // In component
   const { items, addToCart } = useCart();
   ```

### CSS and Styling

1. **Use Tailwind CSS classes**
   ```typescript
   // Good
   <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">

   // Bad (inline styles)
   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
   ```

2. **Use shadcn/ui components**
   ```typescript
   // Good
   import { Button } from '@/components/ui/button';
   <Button variant="outline">Click me</Button>

   // Bad (custom button)
   <button className="px-4 py-2 border rounded">Click me</button>
   ```

3. **Responsive design first**
   ```typescript
   // Good (mobile-first)
   <div className="w-full md:w-1/2 lg:w-1/3">

   // Bad
   <div className="w-full xl:w-1/3 md:w-1/2">
   ```

### File Organization

1. **Use barrel exports**
   ```typescript
   // components/ui/index.ts
   export { Button } from './button';
   export { Input } from './input';
   export { Select } from './select';
   ```

2. **Keep components focused**
   ```typescript
   // Good - Single responsibility
   const ProductImage = ({ src, alt }: ProductImageProps) => {
     return <img src={src} alt={alt} className="w-full h-auto" />;
   };

   // Bad - Doing too much
   const ProductCard = ({ product }) => {
     const [isEditing, setIsEditing] = useState(false);
     const handleEdit = () => { /* edit logic */ };
     const handleDelete = () => { /* delete logic */ };
     const handleAddToCart = () => { /* cart logic */ };
     // ... 200 lines of code
   };
   ```

3. **Consistent import order**
   ```typescript
   // 1. React and hooks
   import React, { useState, useEffect } from 'react';

   // 2. Third-party libraries
   import { useQuery } from '@tanstack/react-query';
   import { z } from 'zod';

   // 3. Internal imports (absolute)
   import { Button } from '@/components/ui/button';
   import { useAuth } from '@/hooks/useAuth';

   // 4. Relative imports
   import { ProductCard } from './ProductCard';
   ```

### Error Handling

1. **Use Error Boundaries**
   ```typescript
   <ErrorBoundary fallback={<SomethingWentWrong />}>
     <MyComponent />
   </ErrorBoundary>
   ```

2. **Handle async errors**
   ```typescript
   // Good
   const handleSubmit = async () => {
     try {
       await submitOrder(order);
       toast.success('Order placed successfully!');
     } catch (error) {
       toast.error('Failed to place order');
       console.error('Order submission error:', error);
     }
   };

   // Bad
   const handleSubmit = async () => {
     await submitOrder(order); // Unhandled error
   };
   ```

## Testing

### Writing Tests

1. **Test components**
   ```typescript
   // ProductCard.test.tsx
   import { render, screen } from '@testing-library/react';
   import ProductCard from './ProductCard';

   const mockProduct = {
     id: '1',
     name: 'Test Product',
     price: 99.99,
     image: 'test.jpg'
   };

   test('renders product information', () => {
     render(<ProductCard product={mockProduct} />);
     expect(screen.getByText('Test Product')).toBeInTheDocument();
     expect(screen.getByText('RM 99.99')).toBeInTheDocument();
   });
   ```

2. **Test hooks**
   ```typescript
   // useCart.test.ts
   import { renderHook, act } from '@testing-library/react';
   import useCart from './useCart';

   test('adds item to cart', () => {
     const { result } = renderHook(() => useCart());

     act(() => {
       result.current.addToCart(mockProduct, 1);
     });

     expect(result.current.items).toHaveLength(1);
   });
   ```

3. **Test API calls**
   ```typescript
   // api.test.ts
   import { fetchProducts } from './api';
   import { supabase } from '@/integrations/supabase/client';

   jest.mock('@/integrations/supabase/client');

   test('fetches products successfully', async () => {
     const mockProducts = [{ id: '1', name: 'Product 1' }];
     supabase.from.mockReturnValue({
       select: jest.fn().mockReturnValue({
         eq: jest.fn().mockReturnValue({
           data: mockProducts,
           error: null
         })
       })
     });

     const products = await fetchProducts();
     expect(products).toEqual(mockProducts);
   });
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ProductCard.test.tsx
```

### Coverage Requirements

- Aim for >80% code coverage
- All critical paths must be tested
- Test error cases as well as success cases

## Documentation

### Code Comments

1. **JSDoc for functions**
   ```typescript
   /**
    * Calculates the total price including tax
    * @param amount - Base amount
    * @param taxRate - Tax rate as decimal (0.06 for 6%)
    * @returns Total amount including tax
    */
   const calculateTotalWithTax = (amount: number, taxRate: number): number => {
     return amount * (1 + taxRate);
   };
   ```

2. **Complex logic comments**
   ```typescript
   // Check if user has admin privileges or is the owner of the resource
   const canEdit = user.role === 'admin' || resource.ownerId === user.id;
   ```

### README Updates

When adding new features:
1. Update the main README.md
2. Add examples to documentation
3. Update API documentation if endpoints changed

### API Documentation

Keep API.md updated with:
- New endpoints
- Parameter changes
- Response format updates
- Authentication requirements

## Submitting Changes

### Before Submitting

1. **Run tests**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

2. **Check build**
   ```bash
   npm run build
   ```

3. **Update documentation**
   - README.md
   - CHANGELOG.md
   - API docs

4. **Review your changes**
   ```bash
   git diff --name-only HEAD~1
   git diff HEAD~1
   ```

### Pull Request Template

Use this template for your PR:

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe testing strategy

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented appropriately
- [ ] Documentation updated
- [ ] Tests added
- [ ] All tests passing
```

## Review Process

### What Reviewers Look For

1. **Code Quality**
   - Clean, readable code
   - Proper error handling
   - Performance considerations
   - Security best practices

2. **Testing**
   - Adequate test coverage
   - Test quality
   - Edge cases covered

3. **Documentation**
   - Clear documentation
   - Updated README
   - API documentation

4. **Functionality**
   - Does it solve the problem?
   - Any side effects?
   - Performance impact

### Review Guidelines

- Be constructive and respectful
- Ask questions if something is unclear
- Suggest improvements
- Approve when all criteria are met

## Getting Help

### Channels

1. **GitHub Discussions** - For general questions
2. **GitHub Issues** - For bugs and feature requests
3. **Discord** - For real-time discussions (if available)

### Before Asking

1. Search existing issues and discussions
2. Read documentation thoroughly
3. Try to reproduce the issue
4. Prepare a minimal reproduction case

### Reporting Bugs

When reporting bugs, include:
1. Environment information
2. Steps to reproduce
3. Expected vs actual behavior
4. Error messages/stack traces
5. Screenshots if applicable

## Recognition

### Contributors

All contributors are recognized in:
- AUTHORS.md file
- Release notes
- GitHub contributors list

### Types of Contributions

We value all contributions:
- Code
- Documentation
- Bug reports
- Feature suggestions
- Community support
- Translation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

Thank you for contributing to PharmaNet! 🙏