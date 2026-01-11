🇲🇦 Tarjama - Moroccan Darija Translator
<div align="center">
Tarjama Logo

AI-powered translation for Moroccan Darija — bridging cultures, one word at a time.

Live DemoPWA ReadyMade with Lovable

</div>
✨ Features
🔄 Smart Translation
Bidirectional translation between Darija and 14+ languages
AI-powered accuracy using advanced language models
Context-aware translations with multiple variants
Image translation — snap a photo and get instant translations
Voice input — speak naturally and translate on the fly
🤖 Sahbi — Your Darija Companion
Interactive AI chatbot for learning Moroccan Darija
Configurable script preferences (Latin, Arabic, or both)
Persistent conversation history
Text-to-speech pronunciation
📚 Comprehensive Dictionary
30+ categories covering everyday topics
Audio pronunciation for each phrase
Beautiful Moroccan-inspired design with zellige patterns
Offline access for downloaded languages
🌍 Multilingual Interface
Full UI support for: English, French, Arabic, Darija, Russian
RTL support for Arabic languages
📱 Progressive Web App
Install on any device (mobile, tablet, desktop)
Offline functionality
Native app-like experience
🛠️ Tech Stack
Category	Technologies
Frontend	React 18, TypeScript, Vite
Styling	Tailwind CSS, shadcn/ui
Backend	Supabase (Auth, Database, Edge Functions)
AI	Google Gemini, OpenAI GPT
i18n	i18next, react-i18next
PWA	vite-plugin-pwa, Workbox
🚀 Getting Started
Prerequisites
Node.js 18+ or Bun
npm, yarn, or bun
Installation

# Clone the repository
git clone https://github.com/yourusername/tarjama.git
cd tarjama

# Install dependencies
npm install

# Start development server
npm run dev
Visit http://localhost:5173 to see the app.

Environment Variables
Create a .env file with:


VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
📁 Project Structure
src/
├── assets/          # Images, flags, logos
├── components/      # Reusable UI components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization
│   └── locales/     # Translation files (en, fr, ar, dar, ru)
├── pages/           # Route pages
├── utils/           # Utility functions
└── integrations/    # Supabase client & types

supabase/
└── functions/       # Edge functions (translate, chat, transcribe)
🎨 Design Philosophy
Tarjama celebrates Moroccan heritage through:

Zellige patterns — Traditional geometric tile art as decorative corners
Warm color palette — Inspired by Moroccan sunsets and terracotta
Elegant typography — Clean, readable fonts with Arabic support
Smooth animations — Framer Motion for delightful interactions
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

🙏 Acknowledgments
Lovable — AI-powered development platform
shadcn/ui — Beautiful component library
Supabase — Backend infrastructure
The Moroccan community for language insights
<div align="center">
Built with ❤️ for the Moroccan diaspora and language enthusiasts worldwide

Report Bug · Request Feature

</div>
