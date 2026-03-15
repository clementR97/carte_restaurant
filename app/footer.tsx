export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              © 2026 Karu&apos;Foods - Fast Food Antillais
            </p>
            <address className="not-italic text-gray-300 text-sm space-y-1">
              <span className="block font-semibold text-white">Adresse</span>
              <span>123 Rue de la République</span>
              <span>97110 Pointe-à-Pitre</span>
              <span>Guadeloupe</span>
            </address>
            <div className="text-gray-300 text-sm">
              <span className="block font-semibold text-white mb-1">Téléphone</span>
              <a href="tel:+590590000000" className="hover:text-white transition-colors">
                0590 XX XX XX
              </a>
            </div>
          </div>
          <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-700">
            <iframe
              title="Karu'Foods sur Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30907.2602!2d-61.5341!3d16.2412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c133c5c2e2c2e2b%3A0x1!2sPointe-%C3%A0-Pitre%2C%20Guadeloupe!5e0!3m2!1sfr!2sfr!4v1700000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
