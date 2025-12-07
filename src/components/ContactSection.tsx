import { useState } from 'react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:kolawoleoluwasegun567@gmail.com?subject=Message from ${encodeURIComponent(
      formData.name
    )}&body=${encodeURIComponent(formData.message)}%0D%0A%0D%0AFrom: ${encodeURIComponent(
      formData.email
    )}`;
    window.location.href = mailtoLink;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-16 px-4" id="contact">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center text-white">Get In Touch</h2>
        <p className="text-gray-400 text-center mb-8">
          Have a question or want to work together? Feel free to reach out!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-neutralMid border border-neutralDefault focus:outline-none focus:ring-2 focus:ring-primaryDefault text-white"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-neutralMid border border-neutralDefault focus:outline-none focus:ring-2 focus:ring-primaryDefault text-white"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2 text-white">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-neutralMid border border-neutralDefault focus:outline-none focus:ring-2 focus:ring-primaryDefault text-white resize-none"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-primaryDefault text-white rounded-lg hover:bg-opacity-80 transition-all duration-300 font-medium"
          >
            Send Message
          </button>
        </form>

        <div className="mt-12 flex justify-center gap-6">
          <a
            href="https://github.com/demola234"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primaryDefault transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/ademoladev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primaryDefault transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://twitter.com/ademolaDi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primaryDefault transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
