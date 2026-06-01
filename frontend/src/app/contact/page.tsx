export default function Contact() {
  return (
    <div className="min-h-screen bg-white pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-light text-center mb-8">Contact Us</h1>
        <p className="text-gray-600 text-center mb-12">
          Ready to capture your special moments? Get in touch!
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Interested In
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black">
              <option>Wedding Photography</option>
              <option>Event Coverage</option>
              <option>Portrait Session</option>
              <option>Commercial Shoot</option>
              <option>Cinematography</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Tell us about your event..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg"
          >
            Send Message
          </button>
        </form>

        <div className="mt-16 text-center text-gray-500">
          <p className="mb-2">📍 Based in Ghana</p>
          <p className="mb-2">📧 info@mrkvisuals.com</p>
          <p>📱 +233 XX XXX XXXX</p>
        </div>
      </div>
    </div>
  );
}