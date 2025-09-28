function Button({ children, variant = 'primary', onClick, className = '', ...props }) {
  const baseClasses = "flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors duration-200";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 font-bold",
    secondary: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;