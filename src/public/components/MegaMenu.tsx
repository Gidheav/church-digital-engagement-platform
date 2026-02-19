import React, { memo } from 'react';
import { Link } from 'react-router-dom';

interface MegaMenuProps {
  currentPage?: 'home' | 'library' | 'series' | 'practices' | 'connect' | 'events';
}

/**
 * MegaMenu Component - Lazy loaded for performance
 * Split from main navigation to reduce initial bundle size
 */
const MegaMenu: React.FC<MegaMenuProps> = memo(({ currentPage }) => {
  const isLibraryPage = currentPage === 'library';
  
  return (
    <div className="mega-menu absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-surface shadow-hover rounded-card p-8 grid grid-cols-2 gap-8 border border-accent-sand/20">
      <div>
        <h5 className="text-base font-bold uppercase tracking-widest text-text-muted mb-4">Browse Topics</h5>
        <ul className="space-y-3">
          <li>
            <a href="#" className="flex items-center gap-3 text-text-main hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg text-accent-sage" aria-hidden="true">psychology</span>
              Mental Wellness
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 text-text-main hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg text-accent-sage" aria-hidden="true">favorite</span>
              Spiritual Disciplines
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 text-text-main hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg text-accent-sage" aria-hidden="true">group</span>
              Family & Community
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 text-text-main hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg text-accent-sage" aria-hidden="true">auto_stories</span>
              Biblical Studies
            </a>
          </li>
        </ul>
        <div className="mt-6">
          <Link 
            to={isLibraryPage ? "/" : "/library"} 
            className="inline-flex items-center gap-2 text-primary font-bold text-base hover:underline underline-offset-4 decoration-2"
          >
            {isLibraryPage ? (
              <>
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
                Back to Homepage
              </>
            ) : (
              <>
                Go To Library
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </Link>
        </div>
      </div>
      <div>
        <h5 className="text-base font-bold uppercase tracking-widest text-text-muted mb-4">Latest Additions</h5>
        <div className="flex gap-4 group/item cursor-pointer">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {/* Lazy loaded image with proper optimization */}
            <img 
              alt="Practicing Silence article thumbnail" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_0GiwP4BFAbIn7Rm0x4C0uc3VC052VXdrrOlxSoOjENPsk6DaI58tKq_x6tTeaUFqLxRlukC2q71l8fcdHIVVYoC7S9aMWGWXdFJPrbyo4fCACrdl4hmKReYQjo6NAaJbY_JDdQgWuYGSw2PwpvEnM7fExEVgWW_Mz1DTj8tNYzxIprea7LZHkgv-6y0p-PLalzKEMpeQ34okoZGDKV8aBVQebwhivVi0af31shHRXdjU8-FgdZQ97lXkUHetnYm2MFPOZaSPoPo"
              loading="lazy"
              decoding="async"
              width="64"
              height="64"
            />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight group-hover/item:text-primary">Practicing Silence</p>
            <p className="text-base text-text-muted mt-1">Article · 4 min read</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4 group/item cursor-pointer">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              alt="The Shepherd's Voice sermon thumbnail" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA2nq4s3J1jgEiPNOw6LlxJjveanLeRhCAN-FMVpgJUgbnOCsvvtFwUq5YnDiFgpF3BUf8_CKjMcUZDX5KE0bIGcNvB9viHCZri7WLKAalRc0p4j3PvgEaozH0ztWhpZKmsbrXktPUoboM3o7ClEGhRV9s7sGz3cgBX1o8OB8iRYGbfkKZc45Uv8CiuFy2YRhcjOSNM3X4_LXrpWcVS3LKobd9oXd22kMpQqtJSu33MlK0DYsRdRs0nYcJkec4JwplBbaOBrioVIw"
              loading="lazy"
              decoding="async"
              width="64"
              height="64"
            />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight group-hover/item:text-primary">The Shepherd's Voice</p>
            <p className="text-base text-text-muted mt-1">Sermon · 38 min</p>
          </div>
        </div>
      </div>
    </div>
  );
});

MegaMenu.displayName = 'MegaMenu';

export default MegaMenu;
