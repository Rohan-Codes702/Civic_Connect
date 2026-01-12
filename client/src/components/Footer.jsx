export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-12 pb-6">
      <div className="container mx-auto px-6">
        {/* Top Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">CivicConnect</h3>
            <p className="text-gray-400 text-sm">
              CivicConnect is a platform bridging communities with local government. Report issues,
              track progress, and strengthen civic engagement in your neighborhood effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><a className="hover:text-sky-400 transition" href="/">Home</a></li>
              <li><a className="hover:text-sky-400 transition" href="/features">Features</a></li>
              <li><a className="hover:text-sky-400 transition" href="/dashboard">Dashboard</a></li>
              <li><a className="hover:text-sky-400 transition" href="/report">Report an Issue</a></li>
              <li><a className="hover:text-sky-400 transition" href="/auth">Login</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li><a className="hover:text-sky-400 transition" href="#">Blog</a></li>
              <li><a className="hover:text-sky-400 transition" href="#">FAQs</a></li>
              <li><a className="hover:text-sky-400 transition" href="#">Documentation</a></li>
              <li><a className="hover:text-sky-400 transition" href="#">Community</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: <a className="hover:text-sky-400" href="mailto:support@civicconnect.com">support@civicconnect.com</a></li>
              <li>Phone: <a className="hover:text-sky-400" href="tel:+1234567890">+1 234 567 890</a></li>
              <li>Address: 123 Civic Street, City, Country</li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="hover:text-sky-400"><i className="fab fa-facebook-f"></i> Facebook</a>
              <a href="#" className="hover:text-sky-400"><i className="fab fa-twitter"></i> Twitter</a>
              <a href="#" className="hover:text-sky-400"><i className="fab fa-linkedin-in"></i> LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} CivicConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
