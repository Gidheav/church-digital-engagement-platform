// SermonDetail.tsx
import React, { useState } from 'react';
import SharedNavigation from '../../shared/SharedNavigation';

interface SermonDetailProps {
  sermonId?: string;
}

const SermonDetail: React.FC<SermonDetailProps> = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'guide'>('summary');

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased">
      {/* Header */}
      <SharedNavigation currentPage="library" />

      <main className="relative">
        {/* Video Section */}
        <div className="w-full bg-black">
          <div className="max-w-[1000px] mx-auto py-0 md:py-12">
            <div className="relative aspect-video bg-zinc-900 overflow-hidden group">
              <img 
                alt="The Architecture of Peace" 
                className="w-full h-full object-cover opacity-60" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC7xvy53d7nyfoA5Y8-172p_TORXjirXHsOfsLs0gJgaQnMSGxiesGQQoMezVpIuPlQwLrpH4e_9jxencxOXYZ5DawH4EaE9A1Fo2LtQMQSiC73B8Hdnt_caOTvMx9p5U7blR7En0Z8-SNAl3V1KOWIdQLSlO2raeYXDfeSrscGPbUiiK8e13AajllyR7PR4khEzQX8iTgOCKhArwFM89J3t70kmXWG5pjR39MGU_uCc3doWz-5LvJbmXd81yqWjgcH9v4ved_2F8"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full border border-white/40 flex items-center justify-center hover:scale-105 transition-transform bg-white/10 backdrop-blur-sm group-hover:border-white">
                  <span className="material-symbols-outlined text-white text-4xl ml-1">play_arrow</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 flex flex-col md:flex-row gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-12">
            <div className="sticky-sidebar flex flex-col gap-6 text-graphite">
              <button className="hover:text-primary transition-colors" title="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button className="hover:text-primary transition-colors" title="Save">
                <span className="material-symbols-outlined">bookmark</span>
              </button>
              <div className="w-full h-px bg-rule"></div>
              <button className="hover:text-primary transition-colors" title="Download Audio">
                <span className="material-symbols-outlined">headphones</span>
              </button>
              <button className="hover:text-primary transition-colors" title="Download Notes">
                <span className="material-symbols-outlined">description</span>
              </button>
            </div>
          </aside>

          {/* Article Content */}
          <article className="flex-1 max-w-article mx-auto">
            <header className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-primary font-medium text-[12px] uppercase tracking-[1.5px]">Sermon Series: Ephesians</span>
              </div>
              <h1 className="text-[48px] leading-[1.1] font-normal mb-6 text-ink">The Architecture of Peace</h1>
              <div className="flex items-center gap-3 text-graphite font-medium text-[12px] uppercase tracking-[1.5px]">
                <span>Pastor John Doe</span>
                <span className="text-rule">•</span>
                <span>October 12, 2023</span>
                <span className="text-rule">•</span>
                <span>45 min</span>
              </div>
            </header>

            {/* Tabs */}
            <div className="border-b border-rule mb-12 flex gap-8">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'summary' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-graphite hover:text-ink'
                }`}
              >
                Summary
              </button>
              <button 
                onClick={() => setActiveTab('transcript')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'transcript' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-graphite hover:text-ink'
                }`}
              >
                Transcript
              </button>
              <button 
                onClick={() => setActiveTab('guide')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'guide' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-graphite hover:text-ink'
                }`}
              >
                Discussion Guide
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'summary' && (
              <div className="text-[18px] leading-[1.6] text-ink space-y-8">
                <p>
                  In the heart of the Ephesian letter, we find a radical redefinition of what it means to coexist. Paul is not merely talking about a lack of conflict, but the deliberate construction of a new humanity. Peace, in this theological context, is not a feeling; it is an architecture—a structural reality founded on the person of Christ.
                </p>
                <p>
                  The "dividing wall of hostility" that Paul mentions wasn't just a metaphor for the first-century reader. It was a physical, stone barrier in the temple that separated the inner courts from the court of the Gentiles. To breach it was a capital offense. When Paul writes that Christ has broken down this wall, he is describing a structural collapse of every human hierarchy.
                </p>
                <blockquote className="py-12 px-8 my-12 text-center">
                  <p className="font-serif italic text-primary text-3xl md:text-4xl leading-[1.3] max-w-[600px] mx-auto">
                    "Peace is not the absence of tension, but the presence of a person who has dismantled our defenses."
                  </p>
                </blockquote>
                <p>
                  Building a house of peace requires three specific structural elements. First, it requires <strong>Foundation</strong>. You cannot build a community on shared interests or socio-economic status; it must be built on the cornerstone of shared grace. Second, it requires <strong>Framing</strong>. This is where the diverse members of the body are joined together, not by erasing their differences, but by aligning them toward a common center.
                </p>
                <p>
                  Finally, it requires <strong>Finish</strong>. This is the outward expression of the inward peace. How do we live when we are no longer strangers or aliens, but fellow citizens with the saints? It changes the way we handle our neighbor, our enemy, and ourselves.
                </p>
                <div className="mt-16 p-8 hairline-border bg-white space-y-6">
                  <h3 className="text-2xl">Key Theological Points</h3>
                  <ul className="space-y-4 list-disc pl-5 text-graphite">
                    <li>The dismantling of the "Dividing Wall" (Eph 2:14).</li>
                    <li>The transition from Alien to Citizen.</li>
                    <li>Christ as the Chief Cornerstone in the new temple of humanity.</li>
                    <li>Horizontal reconciliation as a prerequisite for vertical worship.</li>
                  </ul>
                </div>
                <p>
                  As we move into this week, consider where you are still building walls. The architecture of the Kingdom is open, inclusive, and grounded in the sacrifice of the cross. Let us be a people who participate in this construction project of peace.
                </p>
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="text-[18px] leading-[1.6] text-ink space-y-8">
                <p className="text-graphite italic">Full transcript will be available soon.</p>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="text-[18px] leading-[1.6] text-ink space-y-8">
                <p className="text-graphite italic">Discussion guide will be available soon.</p>
              </div>
            )}

            {/* Tags and Next Sermon */}
            <div className="mt-20 pt-10 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-rule text-graphite">#Peace</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-rule text-graphite">#Theology</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-rule text-graphite">#Ephesians</span>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold text-[12px] uppercase tracking-widest group">
                Next Sermon
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-rule mt-20 py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="size-5">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="font-serif text-lg font-bold tracking-tight">GRACE / CITY</h2>
          </div>
          <p className="text-graphite text-sm">© 2023 Grace City Church. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-graphite hover:text-primary transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rule px-6 py-4 flex justify-between items-center z-50">
        <button className="text-graphite"><span className="material-symbols-outlined">share</span></button>
        <button className="text-graphite"><span className="material-symbols-outlined">bookmark</span></button>
        <button className="text-graphite"><span className="material-symbols-outlined">headphones</span></button>
        <button className="text-graphite"><span className="material-symbols-outlined">description</span></button>
      </div>

      <style>{`
        .sticky-sidebar {
          position: sticky;
          top: 120px;
        }
        .hairline-border {
          border: 1px solid #E5E7EB;
        }
      `}</style>
    </div>
  );
};

export default SermonDetail;