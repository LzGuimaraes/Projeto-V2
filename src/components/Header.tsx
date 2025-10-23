const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-success" />
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-primary-foreground">Gerenciamento de Projetos</h1>
      </div>
    </header>
  );
};

export default Header;

