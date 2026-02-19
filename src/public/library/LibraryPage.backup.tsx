// SermonArchive.tsx
import React, { useState } from 'react';

const LibraryPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState({
    topics: [] as string[],
    books: ['Ephesians'] as string[],
    speakers: [] as string[]
  });

  const handleCheckboxChange = (category: 'topics' | 'books' | 'speakers', value: string) => {
    setActiveFilters(prev => {
      const current = [...prev[category]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }
      
      return {
        ...prev,
        [category]: current
      };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      topics: [],
      books: [],
      speakers: []
    });
  };

  const removeFilter = (category: 'topics' | 'books' | 'speakers', value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main antialiased min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-text-main">
            {/* Logo Icon */}
            <div className="size-5 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            {/* Logo Text */}
            <h2 className="font-serif text-xl font-bold tracking-tight text-text-main">GRACE / CITY</h2>
          </div>
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#" className="text-text-main hover:text-primary text-sm font-medium transition-colors">Sundays</a>
            <a href="#" className="text-primary text-sm font-medium transition-colors">The Library</a>
            <a href="#" className="text-text-main hover:text-primary text-sm font-medium transition-colors">Ministries</a>
            <a href="#" className="text-text-main hover:text-primary text-sm font-medium transition-colors">Giving</a>
          </nav>
          {/* CTA */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center justify-center px-6 h-10 border border-text-main hover:bg-text-main hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
              Plan A Visit
            </button>
            {/* Mobile Menu Icon */}
            <button className="md:hidden text-text-main">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-normal text-text-main tracking-tight">The Library</h1>
          <p className="mt-4 text-text-muted text-lg font-light max-w-2xl">
            A curated repository of wisdom, teaching, and theological resources designed for your spiritual formation.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* Sidebar / Filters (25% Width) */}
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <div className="sticky top-24 space-y-10">
              {/* Search Input */}
              <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input 
                  className="w-full bg-transparent border-b border-border-subtle focus:border-primary px-8 py-3 outline-none ring-0 placeholder:text-text-muted/60 text-text-main text-base font-medium transition-colors" 
                  placeholder="Search topic, verse, speaker..." 
                  type="text"
                />
              </div>

              {/* Filters Group */}
              <div className="space-y-8">
                {/* Topic Filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Topics</h3>
                  <div className="space-y-3">
                    {['Spiritual Formation', 'Mental Health', 'Theology', 'Community', 'Justice'].map((topic) => (
                      <label key={topic} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          className="custom-checkbox text-primary focus:ring-0" 
                          type="checkbox"
                          checked={activeFilters.topics.includes(topic)}
                          onChange={() => handleCheckboxChange('topics', topic)}
                        />
                        <span className="text-sm text-text-main group-hover:text-primary transition-colors">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-border-subtle"></div>

                {/* Book Filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Books of Bible</h3>
                  <div className="space-y-3">
                    {['Genesis', 'Ephesians', 'Psalms', 'Matthew'].map((book) => (
                      <label key={book} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          className="custom-checkbox text-primary focus:ring-0" 
                          type="checkbox"
                          checked={activeFilters.books.includes(book)}
                          onChange={() => handleCheckboxChange('books', book)}
                        />
                        <span className={`text-sm text-text-main ${activeFilters.books.includes(book) ? 'font-medium' : ''} group-hover:text-primary transition-colors`}>{book}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-border-subtle"></div>

                {/* Speaker Filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Speakers</h3>
                  <div className="space-y-3">
                    {['Pastor John Doe', 'Sarah Smith', 'Dr. Ray Green'].map((speaker) => (
                      <label key={speaker} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          className="custom-checkbox text-primary focus:ring-0" 
                          type="checkbox"
                          checked={activeFilters.speakers.includes(speaker)}
                          onChange={() => handleCheckboxChange('speakers', speaker)}
                        />
                        <span className="text-sm text-text-main group-hover:text-primary transition-colors">{speaker}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden lg:block w-px bg-border-subtle absolute left-[25%] top-0 bottom-0 h-full -ml-6"></div>

          {/* Content Grid (75% Width) */}
          <section className="w-full lg:w-3/4 flex-grow pl-0 lg:pl-12">
            {/* Active Filters & Count */}
            <div className="flex flex-wrap items-center justify-between mb-8 pb-4 border-b border-border-subtle">
              <p className="text-sm text-text-muted">Showing <span className="text-text-main font-semibold">12</span> results</p>
              
              {(activeFilters.topics.length > 0 || activeFilters.books.length > 0 || activeFilters.speakers.length > 0) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-muted uppercase mr-2">Active:</span>
                  {activeFilters.books.map(book => (
                    <div key={book} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-sm">
                      {book}
                      <button onClick={() => removeFilter('books', book)} className="hover:text-primary/70">
                        <span className="material-symbols-outlined text-[14px] align-middle">close</span>
                      </button>
                    </div>
                  ))}
                  {activeFilters.topics.map(topic => (
                    <div key={topic} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-sm">
                      {topic}
                      <button onClick={() => removeFilter('topics', topic)} className="hover:text-primary/70">
                        <span className="material-symbols-outlined text-[14px] align-middle">close</span>
                      </button>
                    </div>
                  ))}
                  {activeFilters.speakers.map(speaker => (
                    <div key={speaker} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-sm">
                      {speaker}
                      <button onClick={() => removeFilter('speakers', speaker)} className="hover:text-primary/70">
                        <span className="material-symbols-outlined text-[14px] align-middle">close</span>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-text-muted hover:text-text-main ml-4 underline decoration-1 underline-offset-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {/* Sermon Cards */}
              {[
                {
                  date: 'Oct 12, 2023',
                  speaker: 'John Doe',
                  title: 'The Architecture of Peace',
                  tags: ['Peace', 'Ephesians'],
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC7xvy53d7nyfoA5Y8-172p_TORXjirXHsOfsLs0gJgaQnMSGxiesGQQoMezVpIuPlQwLrpH4e_9jxencxOXYZ5DawH4EaE9A1Fo2LtQMQSiC73B8Hdnt_caOTvMx9p5U7blR7En0Z8-SNAl3V1KOWIdQLSlO2raeYXDfeSrscGPbUiiK8e13AajllyR7PR4khEzQX8iTgOCKhArwFM89J3t70kmXWG5pjR39MGU_uCc3doWz-5LvJbmXd81yqWjgcH9v4ved_2F8'
                },
                {
                  date: 'Oct 05, 2023',
                  speaker: 'Sarah Smith',
                  title: 'Walking in Wisdom',
                  tags: ['Wisdom', 'Proverbs'],
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx_6qJ7ycuhsdSolqougvZohmBKnZJWlZ9o5KZogQvswnL68znyh302n7jZW7evX65t69zulYAPvVSmdlyDM6IWkL36SZwLN9_cBUTf-YT_SIuisBlKQ34f5pxsWULOzOsQ8kbf46CUBD1AYdNgdNOWyZ8Xu-vsV0NOQl7yiQR9QYMFDL-c2in9D544R2J3-j-ERA3oIl7B8wFFcLoAsK6AG9_7pvJamgn-YYWGb1h5b9Uw-Ij2FXvihGSLk92Ncgq8Cy_YAhGk4s'
                },
                {
                  date: 'Sep 28, 2023',
                  speaker: 'Dr. Ray Green',
                  title: 'Silence and Solitude',
                  tags: ['Formation', 'Practices'],
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8q1lsK8pXYYTxUZOnm1ZfSpT1da8W8BwPNHbkIPMmDs1hxmRlvVneP5jyufYV49Af2YUDVjaleyF4QU3oD1PTBgVnYMIACYpIMVVHGNEad76Pa-iNWvTrFzzyipo3pIcMyMHqceNe8wnHzirA1fG-WNaO-Br-bBdTNx3D8jCRbbNNHXCxNwRwZnLWkNytRWuT9uYxneO-i7MFMdTVwXtYUrw6EuwVlVqrlUkPGZD5zhvFcdKx4vomkkK7ZiVjuRhVsg-C16hIGtY'
                },
                {
                  date: 'Sep 21, 2023',
                  speaker: 'John Doe',
                  title: 'The Cost of Discipleship',
                  tags: ['Luke'],
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWl9CJh28lkXZfimkGJbleBlpJ0uftHboFm4R5I7dJzkN0W6gacD4fttIBWRotNWjo0shYoSJ2XSJB8veQ5ArQXDuoxaKnTF-2NqlN3Qyh-Tf_VNHc5ZfbjriGByc_VU3l1fxPxfDCEjgr0HjiD2TgrUd8yEX2TTG96Q2SRL-32QUlHAFnodXzLHe7q4RTNxkQriLBQ_qB0lydxVHjCKFwTqN4TbYHHsmrokQfO0a10LJbutrh38aSXV8WqFs0BAIAslVB42TqJqo'
                },
                {
                  date: 'Sep 14, 2023',
                  speaker: 'Sarah Smith',
                  title: 'Community in Crisis',
                  tags: ['Acts', 'Community'],
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5ZIknGERpAaFavJ50H3vh6tFRpx0kU_oBVf9owlRMz9gJRM7uRN_DCEKaYbg8F_FSyGAxK4l7M9Jq0PyGL4M6Z3DSRRz-IPBYG7_rev1GYlG46CZtMqaJZEFd-PyoROrVstVpz8MKYxGXBC5AzRN6lqzOiSGxr0HzbM_SvoWK-QHLWDXDPhxNnb5pMg0k1x8HH3JB5b-Zhyo6NrcQgzZhNGQXQDwS9Pgl19qYzZolu017vir4PHBpeZkKXmu_ZPwz6yICASWtTTY'
                },
                {
                  date: 'Sep 07, 2023',
                  speaker: 'Dr. Ray Green',
                  title: 'Parables of Growth',
                  tags: ['Mark', 'Kingdom'],
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4YyHfHQZMCtZSEKsDDrdvgIbjfUHgmjLHMSPFs0oLU8yFbkawz8UyYy3P12YIHiVKr9JKnQKAF-T7JrkK6FMDtDb5jeOXjpfND5noJ6lR2Ay0BYPo5F1bPqfLEMkRyg0XX-S7dR9L_O6ivihG85WLXKiW94C1EbkOdO9zSykH103gZcOgbrE9vXeHQlSbduuNjcE2J2p5pg3e8eTVa4J4c3jZal3zHzcEDGrjPS-GLcsi2C5u7Y4TdZU-y_jjPpXzf37BEHp5oYU'
                }
              ].map((sermon, index) => (
                <article key={index} className="group cursor-pointer flex flex-col h-full">
                  <div className="relative aspect-video overflow-hidden bg-gray-100 mb-4 rounded-none">
                    <img 
                      alt={sermon.title} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                      src={sermon.img}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                      <span>{sermon.date}</span>
                      <span className="text-border-subtle">•</span>
                      <span>{sermon.speaker}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-text-main leading-snug group-hover:underline decoration-1 underline-offset-4 mb-3">
                      {sermon.title}
                    </h3>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {sermon.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 border border-border-subtle text-text-muted rounded-full">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-20 flex justify-center">
              <button className="text-sm font-semibold tracking-wide text-text-main border-b-2 border-text-main hover:text-primary hover:border-primary transition-colors pb-1 uppercase">
                Load More Sermons
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-border-subtle mt-12 py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-text-main">
            <div className="size-5">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="font-serif text-lg font-bold tracking-tight">GRACE / CITY</h2>
          </div>
          <p className="text-text-muted text-sm">© 2024 Grace City Church. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-primary transition-colors">
              <span className="sr-only">Instagram</span>
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06h.63zm1.673 5.378c-.628 0-1.135.507-1.135 1.135 0 .628.507 1.135 1.135 1.135.628 0 1.135-.507 1.135-1.135 0-.628-.507-1.135-1.135-1.135zm-4.662 1.838c-3.17 0-5.74 2.57-5.74 5.74s2.57 5.74 5.74 5.74 5.74-2.57 5.74-5.74-2.57-5.74-5.74-5.74zM12 11.965c-1.688 0-3.056 1.368-3.056 3.056 0 1.688 1.368 3.056 3.056 3.056 1.688 0 3.056-1.368 3.056-3.056 0-1.688-1.368-3.056-3.056-3.056z" fillRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-checkbox {
          appearance: none;
          background-color: transparent;
          margin: 0;
          font: inherit;
          color: currentColor;
          width: 1.15em;
          height: 1.15em;
          border: 1px solid #d1d5db;
          border-radius: 0;
          display: grid;
          place-content: center;
        }

        .custom-checkbox::before {
          content: "";
          width: 0.65em;
          height: 0.65em;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em #2462f5;
          transform-origin: center;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }

        .custom-checkbox:checked::before {
          transform: scale(1);
        }

        .custom-checkbox:focus {
          outline: max(2px, 0.15em) solid currentColor;
          outline-offset: max(2px, 0.15em);
        }
      `}</style>
    </div>
  );
};

export default LibraryPage;
