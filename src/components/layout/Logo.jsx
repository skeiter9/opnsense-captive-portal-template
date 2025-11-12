export function Logo() {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <img
          src="/images/logo.jpg"
          alt="Burbase Logo"
          className="h-24 w-auto object-contain"
        />
      </div>
    </div>
  );
}
