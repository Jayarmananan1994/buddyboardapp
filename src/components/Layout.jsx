import Header from './Header';

function Layout({ children }) {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light text-slate-800">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;