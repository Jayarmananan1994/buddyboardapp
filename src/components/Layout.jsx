import Header from './Header';
import BottomNav from './BottomNav';

function Layout({ children }) {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light text-slate-800">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
}

export default Layout;