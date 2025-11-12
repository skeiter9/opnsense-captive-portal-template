export function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-2xl ring-4 ring-white/20 hover:scale-105 transition-transform duration-300">
        <img
          src="/images/logo.jpg"
          alt="Burbase Logo"
          className="h-28 w-auto object-contain"
        />
      </div>
    </div>
  );
}
