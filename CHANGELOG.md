# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2025-12-28

- Remove deprecated files and refactor project structure

### Fixed
- Fix API routes accessibility - Create wrapper files in `app/api/` to re-export from `core/app/api/`
- Resolve 404 errors for API endpoints (e.g., `/api/auth/refresh`)

### Added
- Complete project documentation in README.md
- API routes wrapper files for Next.js App Router compatibility

### Verified
- Core independence - Confirmed no hard dependencies on project directory
- Security audit - All security measures verified
- Performance optimizations verified

- Update project files and enhance authentication hooks
- Refactor project structure and update configurations

## [0.2.0] - 2025-12-27

- Enhance security and refactor authentication system

## [0.1.6] - 2025-12-27

- Update login system
- Refactor logging and security monitoring

## [0.1.5] - 2025-12-23

- Add assets directory  
  - Fonts  
  - Media  
  - SVGs  
- Edit Pelak CSS  
  - Units  
  - Border radius  
  - Font sizes  
- Add font libraries  
- Add site configuration  
- Add site types  
- Change layout structure
- Add seo data
- Add favicons
- Add schema seo
- Add manifest
- Add robots
- Add Multilingual
- Improve site security

## [0.1.4] - 2025-12-14

- Eemove globals.css and update import path in layout.tsx

## [0.1.3] - 2025-12-14

- Version and push

## [0.1.2] - 2025-12-14

- Tag and version and push

## [0.1.1] - 2025-12-14

### Added
- Tag and version

## [0.1.0] - 2025-12-14

### Added
- Initial project setup
- Next.js 16 configuration
- Tailwind CSS integration