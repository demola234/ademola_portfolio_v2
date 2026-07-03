const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-8 mt-8">
      <hr className="border-gray-700 mb-6" />
      <div className="flex justify-right text-sm">
        &copy; {new Date().getFullYear()} Ademola.
      </div>
    </footer>
  );
};

export default Footer;
