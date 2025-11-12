export function Logo() {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-white p-2 rounded-2xl shadow-2xl ring-4 ring-white/20 hover:scale-105 transition-transform duration-300">
        <img
          src="/images/logo.jpg"
          alt="Burbase Logo"
          className="h-28 w-auto object-contain rounded-2xl"
        />
      </div>
    </div>
  );
}
