import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { 
  Search, ArrowLeft, MessageCircle, Users, MessageSquare, HandHeart, 
  UtensilsCrossed, Home, Heart, CloudSun, Mountain, ShoppingBag, Clock, 
  Hash, Wallet, Ticket, Phone, Compass, Car, CalendarDays, Package, 
  Zap, Sparkles, Palette, MapPin, Thermometer, Smile, BookOpen, Dumbbell
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { WordDetailDialog } from "@/components/WordDetailDialog";
import { toast } from "sonner";
import { ZelligeCorners } from "@/components/ZelligeCorners";

interface DictionaryEntry {
  darija: string;
  french: string;
  english: string;
  category: string;
  example?: string;
  type?: string;
  definition?: string;
  examples?: Array<{
    darija: string;
    arabic: string;
    french: string;
    english: string;
  }>;
  relatedWords?: string[];
  pronunciation?: string;
}

// Category configuration with icons, colors and themes
const categoryConfig: Record<string, { 
  icon: React.ElementType; 
  gradient: string; 
  borderColor: string;
  iconColor: string;
  bgPattern?: string;
}> = {
  "Essentials": { 
    icon: Sparkles, 
    gradient: "from-amber-500/20 to-orange-500/10", 
    borderColor: "border-amber-500/50",
    iconColor: "text-amber-600 dark:text-amber-400"
  },
  "Greetings": { 
    icon: MessageSquare, 
    gradient: "from-emerald-500/20 to-teal-500/10", 
    borderColor: "border-emerald-500/50",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  "First Encounters": { 
    icon: Users, 
    gradient: "from-blue-500/20 to-cyan-500/10", 
    borderColor: "border-blue-500/50",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  "Politeness": { 
    icon: HandHeart, 
    gradient: "from-pink-500/20 to-rose-500/10", 
    borderColor: "border-pink-500/50",
    iconColor: "text-pink-600 dark:text-pink-400"
  },
  "Food & Drinks": { 
    icon: UtensilsCrossed, 
    gradient: "from-orange-500/20 to-red-500/10", 
    borderColor: "border-orange-500/50",
    iconColor: "text-orange-600 dark:text-orange-400"
  },
  "Guesthouse": { 
    icon: Home, 
    gradient: "from-violet-500/20 to-purple-500/10", 
    borderColor: "border-violet-500/50",
    iconColor: "text-violet-600 dark:text-violet-400"
  },
  "Family": { 
    icon: Heart, 
    gradient: "from-rose-500/20 to-pink-500/10", 
    borderColor: "border-rose-500/50",
    iconColor: "text-rose-600 dark:text-rose-400"
  },
  "Nature": { 
    icon: CloudSun, 
    gradient: "from-sky-500/20 to-blue-500/10", 
    borderColor: "border-sky-500/50",
    iconColor: "text-sky-600 dark:text-sky-400"
  },
  "Weather": { 
    icon: Thermometer, 
    gradient: "from-cyan-500/20 to-blue-500/10", 
    borderColor: "border-cyan-500/50",
    iconColor: "text-cyan-600 dark:text-cyan-400"
  },
  "Hiking": { 
    icon: Mountain, 
    gradient: "from-green-500/20 to-emerald-500/10", 
    borderColor: "border-green-500/50",
    iconColor: "text-green-600 dark:text-green-400"
  },
  "Shopping": { 
    icon: ShoppingBag, 
    gradient: "from-fuchsia-500/20 to-pink-500/10", 
    borderColor: "border-fuchsia-500/50",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400"
  },
  "Time": { 
    icon: Clock, 
    gradient: "from-indigo-500/20 to-violet-500/10", 
    borderColor: "border-indigo-500/50",
    iconColor: "text-indigo-600 dark:text-indigo-400"
  },
  "Numbers": { 
    icon: Hash, 
    gradient: "from-teal-500/20 to-cyan-500/10", 
    borderColor: "border-teal-500/50",
    iconColor: "text-teal-600 dark:text-teal-400"
  },
  "Money": { 
    icon: Wallet, 
    gradient: "from-yellow-500/20 to-amber-500/10", 
    borderColor: "border-yellow-500/50",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  "Transportation": { 
    icon: Car, 
    gradient: "from-slate-500/20 to-gray-500/10", 
    borderColor: "border-slate-500/50",
    iconColor: "text-slate-600 dark:text-slate-400"
  },
  "Pronouns": { 
    icon: Users, 
    gradient: "from-purple-500/20 to-violet-500/10", 
    borderColor: "border-purple-500/50",
    iconColor: "text-purple-600 dark:text-purple-400"
  },
  "Verbs": { 
    icon: Zap, 
    gradient: "from-red-500/20 to-orange-500/10", 
    borderColor: "border-red-500/50",
    iconColor: "text-red-600 dark:text-red-400"
  },
  "Nouns": { 
    icon: Package, 
    gradient: "from-blue-500/20 to-indigo-500/10", 
    borderColor: "border-blue-500/50",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  "Adjectives": { 
    icon: Palette, 
    gradient: "from-pink-500/20 to-purple-500/10", 
    borderColor: "border-pink-500/50",
    iconColor: "text-pink-600 dark:text-pink-400"
  },
  "Questions": { 
    icon: MessageCircle, 
    gradient: "from-amber-500/20 to-yellow-500/10", 
    borderColor: "border-amber-500/50",
    iconColor: "text-amber-600 dark:text-amber-400"
  },
  "Common": { 
    icon: Sparkles, 
    gradient: "from-emerald-500/20 to-green-500/10", 
    borderColor: "border-emerald-500/50",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  "Days": { 
    icon: CalendarDays, 
    gradient: "from-blue-500/20 to-sky-500/10", 
    borderColor: "border-blue-500/50",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  "Directions": { 
    icon: Compass, 
    gradient: "from-teal-500/20 to-green-500/10", 
    borderColor: "border-teal-500/50",
    iconColor: "text-teal-600 dark:text-teal-400"
  },
  "Places": { 
    icon: MapPin, 
    gradient: "from-rose-500/20 to-red-500/10", 
    borderColor: "border-rose-500/50",
    iconColor: "text-rose-600 dark:text-rose-400"
  },
  "Body": { 
    icon: Dumbbell, 
    gradient: "from-orange-500/20 to-amber-500/10", 
    borderColor: "border-orange-500/50",
    iconColor: "text-orange-600 dark:text-orange-400"
  },
  "Emotions": { 
    icon: Smile, 
    gradient: "from-yellow-500/20 to-orange-500/10", 
    borderColor: "border-yellow-500/50",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  "States": { 
    icon: Smile, 
    gradient: "from-cyan-500/20 to-teal-500/10", 
    borderColor: "border-cyan-500/50",
    iconColor: "text-cyan-600 dark:text-cyan-400"
  },
  "Colors": { 
    icon: Palette, 
    gradient: "from-violet-500/20 to-fuchsia-500/10", 
    borderColor: "border-violet-500/50",
    iconColor: "text-violet-600 dark:text-violet-400"
  },
  "Objects": { 
    icon: Package, 
    gradient: "from-gray-500/20 to-slate-500/10", 
    borderColor: "border-gray-500/50",
    iconColor: "text-gray-600 dark:text-gray-400"
  },
  "Actions": { 
    icon: Zap, 
    gradient: "from-lime-500/20 to-green-500/10", 
    borderColor: "border-lime-500/50",
    iconColor: "text-lime-600 dark:text-lime-400"
  },
  "Expressions": { 
    icon: MessageSquare, 
    gradient: "from-indigo-500/20 to-blue-500/10", 
    borderColor: "border-indigo-500/50",
    iconColor: "text-indigo-600 dark:text-indigo-400"
  },
  "Descriptions": { 
    icon: BookOpen, 
    gradient: "from-emerald-500/20 to-teal-500/10", 
    borderColor: "border-emerald-500/50",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  }
};

const defaultCategory = { 
  icon: BookOpen, 
  gradient: "from-primary/20 to-primary/5", 
  borderColor: "border-primary/50",
  iconColor: "text-primary"
};

const Dictionary = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const dictionaryEntries: DictionaryEntry[] = [
    // ===== ESSENTIALS (from PDF) =====
    { 
      darija: "Ah", 
      french: "Oui", 
      english: "Yes", 
      category: "Essentials",
      type: "expression",
      pronunciation: "ah",
      example: "Ah, fhemt (Yes, I understood)"
    },
    { 
      darija: "La", 
      french: "Non", 
      english: "No", 
      category: "Essentials",
      type: "expression",
      pronunciation: "lah",
      example: "La, mashi hada (No, not this one)"
    },
    { 
      darija: "Wakha", 
      french: "D'accord", 
      english: "OK/Alright", 
      category: "Essentials",
      type: "expression",
      pronunciation: "wah-khah",
      example: "Wakha, ghadi nji (OK, I will come)"
    },
    { 
      darija: "3afak", 
      french: "S'il te plaît", 
      english: "Please", 
      category: "Essentials",
      type: "expression",
      pronunciation: "ah-fak",
      example: "3afak, 3tini lma (Please, give me water)"
    },
    { 
      darija: "Shokran", 
      french: "Merci", 
      english: "Thank you", 
      category: "Essentials",
      type: "expression",
      pronunciation: "shok-ran",
      example: "Shokran bzzaf (Thank you very much)"
    },
    { 
      darija: "Mashi moshkil", 
      french: "Pas de problème", 
      english: "No problem", 
      category: "Essentials",
      type: "phrase",
      pronunciation: "mah-shi mosh-keel",
      example: "Mashi moshkil, n3awnk (No problem, I'll help you)"
    },

    // ===== GREETINGS (from PDF) =====
    { 
      darija: "Ssalam", 
      french: "Salut/Bonjour", 
      english: "Hi/Hello", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "ssa-lam",
      definition: "Informal greeting used any time of day",
      examples: [
        { darija: "Ssalam, kif dayr?", arabic: "سلام، كيف دايْر؟", french: "Salut, comment vas-tu?", english: "Hi, how are you?" }
      ]
    },
    { 
      darija: "Ssalam o 3alaykom", 
      french: "Bonjour/Paix sur vous", 
      english: "Peace be upon you (Hello)", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "ssa-lam oh ah-lay-kom",
      definition: "Formal Islamic greeting"
    },
    { 
      darija: "Wa 3alaykom ssalam", 
      french: "Et sur vous la paix", 
      english: "And peace be upon you (Response)", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "wah ah-lay-kom ssa-lam",
      definition: "Response to Ssalam o 3alaykom"
    },
    { 
      darija: "SbaH lkhir", 
      french: "Bonjour (matin)", 
      english: "Good morning", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "sbah l-kheer",
      example: "SbaH lkhir, labas 3lik? (Good morning, how are you?)"
    },
    { 
      darija: "Masa lkhir", 
      french: "Bonsoir", 
      english: "Good evening", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "mah-sah l-kheer"
    },
    { 
      darija: "TsbH 3la khir", 
      french: "Bonne nuit", 
      english: "Good night", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "tsbah ah-la kheer"
    },
    { 
      darija: "Kidayr?", 
      french: "Comment vas-tu? (m)", 
      english: "How are you? (masculine)", 
      category: "Greetings",
      type: "question",
      pronunciation: "kee-day-r"
    },
    { 
      darija: "Kidayra?", 
      french: "Comment vas-tu? (f)", 
      english: "How are you? (feminine)", 
      category: "Greetings",
      type: "question",
      pronunciation: "kee-day-rah"
    },
    { 
      darija: "Kolshi bikhir", 
      french: "Tout va bien", 
      english: "All is fine", 
      category: "Greetings",
      type: "response",
      pronunciation: "kol-shi bi-kheer"
    },
    { 
      darija: "LHamdo lillah", 
      french: "Dieu merci", 
      english: "Thanks to God", 
      category: "Greetings",
      type: "expression",
      pronunciation: "l-ham-do lil-lah"
    },
    { 
      darija: "Bslama", 
      french: "Au revoir", 
      english: "Goodbye", 
      category: "Greetings",
      type: "greeting",
      pronunciation: "b-sla-ma"
    },
    { 
      darija: "Ntshawfo ghdda", 
      french: "À demain", 
      english: "See you tomorrow", 
      category: "Greetings",
      type: "phrase",
      pronunciation: "n-tshaw-fo ghad-da"
    },
    { 
      darija: "Thalla frask", 
      french: "Prends soin de toi", 
      english: "Take care", 
      category: "Greetings",
      type: "phrase",
      pronunciation: "thal-la f-ra-sek"
    },

    // ===== FIRST ENCOUNTERS (from PDF) =====
    { 
      darija: "Chno smitk?", 
      french: "Comment t'appelles-tu?", 
      english: "What is your name?", 
      category: "First Encounters",
      type: "question",
      pronunciation: "shno smee-tek"
    },
    { 
      darija: "Smiti...", 
      french: "Je m'appelle...", 
      english: "My name is...", 
      category: "First Encounters",
      type: "phrase",
      pronunciation: "smee-tee"
    },
    { 
      darija: "Matsharfin", 
      french: "Enchanté", 
      english: "Nice to meet you", 
      category: "First Encounters",
      type: "greeting",
      pronunciation: "mat-shar-feen"
    },
    { 
      darija: "Wash katskn hna?", 
      french: "Tu habites ici?", 
      english: "Do you live here?", 
      category: "First Encounters",
      type: "question",
      pronunciation: "wash kat-sken hna"
    },
    { 
      darija: "Fin katskn?", 
      french: "Où habites-tu?", 
      english: "Where do you live?", 
      category: "First Encounters",
      type: "question",
      pronunciation: "feen kat-sken"
    },
    { 
      darija: "Fash khddam?", 
      french: "Quel est ton travail?", 
      english: "What is your job?", 
      category: "First Encounters",
      type: "question",
      pronunciation: "fash khad-dam"
    },
    { 
      darija: "Mnin nta?", 
      french: "D'où viens-tu? (m)", 
      english: "Where are you from? (m)", 
      category: "First Encounters",
      type: "question",
      pronunciation: "mneen n-ta"
    },
    { 
      darija: "Ana mn mirikan", 
      french: "Je suis des États-Unis", 
      english: "I am from the USA", 
      category: "First Encounters",
      type: "phrase",
      pronunciation: "ana mn mee-ree-kan"
    },
    { 
      darija: "Ana kanskn f...", 
      french: "J'habite à...", 
      english: "I live in...", 
      category: "First Encounters",
      type: "phrase",
      pronunciation: "ana kan-sken f"
    },

    // ===== GUESTHOUSE (from PDF) =====
    { 
      darija: "Bghit shi bit 3afak", 
      french: "Je voudrais une chambre", 
      english: "I would like a room please", 
      category: "Guesthouse",
      type: "phrase",
      pronunciation: "bgheet shi beet ah-fak"
    },
    { 
      darija: "BshHal kayn lbit?", 
      french: "Combien coûte la chambre?", 
      english: "How much is a room?", 
      category: "Guesthouse",
      type: "question",
      pronunciation: "bsh-hal kayn l-beet"
    },
    { 
      darija: "Wash kayn lma skhon?", 
      french: "Y a-t-il de l'eau chaude?", 
      english: "Is hot water available?", 
      category: "Guesthouse",
      type: "question",
      pronunciation: "wash kayn l-ma skh-oon"
    },
    { 
      darija: "Lftor", 
      french: "Petit-déjeuner", 
      english: "Breakfast", 
      category: "Guesthouse",
      type: "noun",
      pronunciation: "l-ftoor"
    },
    { 
      darija: "Lghda", 
      french: "Déjeuner", 
      english: "Lunch", 
      category: "Guesthouse",
      type: "noun",
      pronunciation: "l-ghda"
    },
    { 
      darija: "L3sha", 
      french: "Dîner", 
      english: "Dinner", 
      category: "Guesthouse",
      type: "noun",
      pronunciation: "l-a-sha"
    },
    { 
      darija: "Imta lghda?", 
      french: "À quelle heure le déjeuner?", 
      english: "When is lunch?", 
      category: "Guesthouse",
      type: "question",
      pronunciation: "eem-ta l-ghda"
    },

    // ===== FOOD & DRINKS (from PDF) =====
    { 
      darija: "Lmakla bnina", 
      french: "La nourriture est délicieuse", 
      english: "The food is delicious", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "l-mak-la bnee-na"
    },
    { 
      darija: "3afak 3tini...", 
      french: "S'il te plaît donne-moi...", 
      english: "Please give me...", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "ah-fak tee-nee"
    },
    { 
      darija: "Qr3a dyal lma", 
      french: "Une bouteille d'eau", 
      english: "A bottle of water", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "qra dyal l-ma"
    },
    { 
      darija: "Makanakolsh lHm", 
      french: "Je ne mange pas de viande", 
      english: "I don't eat meat", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "ma-ka-na-kol-sh l-ham"
    },
    { 
      darija: "Kanakol ghir lkhodra", 
      french: "Je mange seulement des légumes", 
      english: "I am a vegetarian", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "ka-na-kol gheer l-khod-ra"
    },
    { 
      darija: "Fiya lhasasiyya dyal...", 
      french: "Je suis allergique à...", 
      english: "I am allergic to...", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "fee-ya l-ha-sa-see-ya dyal"
    },
    { 
      darija: "Bghit atay bla sokar", 
      french: "Je veux du thé sans sucre", 
      english: "I want tea with no sugar", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "bgheet a-tay bla so-kar"
    },
    { 
      darija: "Qhwa kaHla", 
      french: "Café noir", 
      english: "Black coffee", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "qah-wa kah-la"
    },
    { 
      darija: "Qhwa blHlib", 
      french: "Café au lait", 
      english: "Coffee with milk", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "qah-wa b-l-hleeb"
    },
    { 
      darija: "Hlow bzzaf", 
      french: "Trop sucré", 
      english: "Too sweet", 
      category: "Food & Drinks",
      type: "phrase",
      pronunciation: "hloo bzaf"
    },
    { darija: "lma", french: "Eau", english: "Water", category: "Food & Drinks", type: "noun", example: "3tini lma 3afak (Give me water please)" },
    { darija: "atay", french: "Thé", english: "Tea", category: "Food & Drinks", type: "noun", example: "Bghit atay b na3na3 (I want mint tea)" },
    { darija: "qahwa", french: "Café", english: "Coffee", category: "Food & Drinks", type: "noun", example: "Qahwa s-khuna 3afak (Hot coffee please)" },
    { darija: "hlib", french: "Lait", english: "Milk", category: "Food & Drinks", type: "noun" },
    { darija: "khobz", french: "Pain", english: "Bread", category: "Food & Drinks", type: "noun" },
    { darija: "lHm", french: "Viande", english: "Meat", category: "Food & Drinks", type: "noun" },
    { darija: "lbgri", french: "Bœuf", english: "Beef", category: "Food & Drinks", type: "noun" },
    { darija: "lghnmi", french: "Agneau", english: "Lamb", category: "Food & Drinks", type: "noun" },
    { darija: "kfta", french: "Viande hachée", english: "Ground beef", category: "Food & Drinks", type: "noun" },
    { darija: "djaj", french: "Poulet", english: "Chicken", category: "Food & Drinks", type: "noun" },
    { darija: "hout", french: "Poisson", english: "Fish", category: "Food & Drinks", type: "noun" },
    { darija: "lkhodra", french: "Légumes", english: "Vegetables", category: "Food & Drinks", type: "noun" },
    { darija: "shlada", french: "Salade", english: "Salad", category: "Food & Drinks", type: "noun" },
    { darija: "lfol", french: "Fèves", english: "Broad beans", category: "Food & Drinks", type: "noun" },
    { darija: "kawkaw", french: "Cacahuètes", english: "Peanuts", category: "Food & Drinks", type: "noun" },
    { darija: "ssokkar", french: "Sucre", english: "Sugar", category: "Food & Drinks", type: "noun" },
    { darija: "lmlHa", french: "Sel", english: "Salt", category: "Food & Drinks", type: "noun" },
    { darija: "msloq", french: "Bouilli", english: "Boiled", category: "Food & Drinks", type: "adjective" },
    { darija: "mqli", french: "Frit", english: "Fried", category: "Food & Drinks", type: "adjective" },

    // ===== FAMILY (from PDF) =====
    { darija: "Lwalida", french: "Mère", english: "Mother", category: "Family", type: "noun", pronunciation: "l-wa-lee-da" },
    { darija: "Lwalid", french: "Père", english: "Father", category: "Family", type: "noun", pronunciation: "l-wa-leed" },
    { darija: "Khoya", french: "Mon frère", english: "My brother", category: "Family", type: "noun", pronunciation: "kho-ya" },
    { darija: "Khti", french: "Ma sœur", english: "My sister", category: "Family", type: "noun", pronunciation: "kh-tee" },
    { darija: "Khot", french: "Frères", english: "Brothers", category: "Family", type: "noun" },
    { darija: "Khwatat", french: "Sœurs", english: "Sisters", category: "Family", type: "noun" },
    { darija: "Rajli", french: "Mon mari", english: "My husband", category: "Family", type: "noun" },
    { darija: "Marti", french: "Ma femme", english: "My wife", category: "Family", type: "noun" },
    { darija: "Walidiyya", french: "Mes parents", english: "My parents", category: "Family", type: "noun" },
    { darija: "SaHbi", french: "Mon ami", english: "My friend (m)", category: "Family", type: "noun" },
    { darija: "SaHbti", french: "Mon amie", english: "My friend (f)", category: "Family", type: "noun" },
    { darija: "Mol ddar", french: "Le propriétaire", english: "The house owner", category: "Family", type: "noun" },
    { darija: "Famila", french: "Famille", english: "Family", category: "Family", type: "noun" },
    { darija: "Wash nta mzwj?", french: "Es-tu marié? (m)", english: "Are you married? (m)", category: "Family", type: "question" },
    { darija: "TwaHsht familti", french: "Ma famille me manque", english: "I miss my family", category: "Family", type: "phrase" },

    // ===== NATURE & WEATHER (from PDF) =====
    { darija: "Jbl", french: "Montagne", english: "Mountain", category: "Nature", type: "noun" },
    { darija: "Jnanat", french: "Champs", english: "Fields", category: "Nature", type: "noun" },
    { darija: "Lwad", french: "Rivière", english: "River", category: "Nature", type: "noun" },
    { darija: "Triq", french: "Route", english: "Road", category: "Nature", type: "noun" },
    { darija: "Lmndr", french: "Vue", english: "View", category: "Nature", type: "noun" },
    { darija: "Tabi3a", french: "Nature", english: "Nature", category: "Nature", type: "noun" },
    { darija: "Hna zwin bzzaf", french: "C'est très beau ici", english: "It is very beautiful here", category: "Nature", type: "phrase" },
    { darija: "Jnanat zwininin", french: "Les champs sont beaux", english: "The fields are beautiful", category: "Nature", type: "phrase" },
    { darija: "Skhon lHal lyoum", french: "Il fait chaud aujourd'hui", english: "It is hot today", category: "Weather", type: "phrase" },
    { darija: "Bard lHal lyoum", french: "Il fait froid aujourd'hui", english: "It is cold today", category: "Weather", type: "phrase" },
    { darija: "Kayna shta ghdda", french: "Il va pleuvoir demain", english: "It will rain tomorrow", category: "Weather", type: "phrase" },
    { darija: "Jani lbrd", french: "J'ai froid", english: "I feel cold", category: "Weather", type: "phrase" },
    { darija: "Lbrd", french: "Froid", english: "Cold", category: "Weather", type: "noun" },
    { darija: "Ssahd", french: "Chaleur", english: "Heat", category: "Weather", type: "noun" },
    { darija: "Rbi3", french: "Printemps", english: "Spring", category: "Weather", type: "noun" },
    { darija: "Ssif", french: "Été", english: "Summer", category: "Weather", type: "noun" },
    { darija: "Shta", french: "Hiver/Pluie", english: "Winter/Rain", category: "Weather", type: "noun" },
    { darija: "Lkhrif", french: "Automne", english: "Fall", category: "Weather", type: "noun" },
    { darija: "Tlj", french: "Neige", english: "Snow", category: "Weather", type: "noun" },
    { darija: "Medalla", french: "Parapluie", english: "Umbrella", category: "Weather", type: "noun" },

    // ===== HIKING (from PDF) =====
    { darija: "Bghit nmshi ndor", french: "Je veux faire une randonnée", english: "I want to hike", category: "Hiking", type: "phrase" },
    { darija: "3yit", french: "Je suis fatigué", english: "I am tired", category: "Hiking", type: "phrase" },
    { darija: "Bghit nrtaH", french: "Je veux me reposer", english: "I want to have a break", category: "Hiking", type: "phrase" },
    { darija: "Wash kaynin lklab hna?", french: "Y a-t-il des chiens ici?", english: "Are there any dogs here?", category: "Hiking", type: "question" },
    { darija: "Wash had triq mashi khatar?", french: "Ce chemin est-il sûr?", english: "Is this way safe for me?", category: "Hiking", type: "question" },
    { darija: "Wash momkin nswr?", french: "Puis-je prendre une photo?", english: "Can I take a picture?", category: "Hiking", type: "question" },
    { darija: "Srbi shwiya msha lHal", french: "Dépêche-toi, il est tard", english: "Hurry up, it is late", category: "Hiking", type: "phrase" },
    { darija: "Khasni nshrb lma mzyan", french: "Je dois boire beaucoup d'eau", english: "I need to drink a lot of water", category: "Hiking", type: "phrase" },
    { darija: "Skhona shms", french: "Le soleil est chaud", english: "The sun is hot", category: "Hiking", type: "phrase" },
    { darija: "Sakado", french: "Sac à dos", english: "Backpack", category: "Hiking", type: "noun" },
    { darija: "Lppel", french: "Lampe de poche", english: "Flashlight", category: "Hiking", type: "noun" },
    { darija: "Dora", french: "Randonnée", english: "Hike", category: "Hiking", type: "noun" },
    { darija: "Dwwar", french: "Village", english: "Village", category: "Hiking", type: "noun" },
    { darija: "Lkharita", french: "Carte", english: "Map", category: "Hiking", type: "noun" },
    { darija: "Lgid", french: "Guide", english: "Guide", category: "Hiking", type: "noun" },
    { darija: "Khatar", french: "Dangereux", english: "Dangerous", category: "Hiking", type: "adjective" },
    { darija: "Tswira", french: "Photo", english: "Photo", category: "Hiking", type: "noun" },

    // ===== SHOPPING (from PDF) =====
    { darija: "Fin kayn soq 3afak?", french: "Où est le marché?", english: "Where is the souk please?", category: "Shopping", type: "question" },
    { darija: "Wash 3andk...?", french: "As-tu...?", english: "Do you have...?", category: "Shopping", type: "question" },
    { darija: "BshHal hada?", french: "Combien ça coûte? (m)", english: "How much is that? (m)", category: "Shopping", type: "question" },
    { darija: "BshHal hadi?", french: "Combien ça coûte? (f)", english: "How much is that? (f)", category: "Shopping", type: "question" },
    { darija: "3tini kilo dyal...", french: "Donne-moi un kilo de...", english: "Give me a kilo of...", category: "Shopping", type: "phrase" },
    { darija: "Ghali bzzaf", french: "Trop cher", english: "Too expensive", category: "Shopping", type: "phrase" },
    { darija: "Nqs shwiya 3afak", french: "Baisse un peu s'il te plaît", english: "Remove a little bit please", category: "Shopping", type: "phrase" },
    { darija: "Wash nqdr njrbo?", french: "Puis-je l'essayer?", english: "Can I try it on?", category: "Shopping", type: "question" },
    { darija: "Majash m3aya", french: "Ça ne me va pas", english: "It doesn't fit", category: "Shopping", type: "phrase" },
    { darija: "Bghit nshri hada", french: "Je veux acheter ceci", english: "I want to buy this", category: "Shopping", type: "phrase" },
    { darija: "LHanot", french: "Magasin", english: "Store", category: "Shopping", type: "noun" },
    { darija: "Resharge", french: "Recharge téléphone", english: "Phone minutes", category: "Shopping", type: "noun" },
    { darija: "Lbosta", french: "Bureau de poste", english: "Post office", category: "Shopping", type: "noun" },
    { darija: "MHlol", french: "Ouvert", english: "Open", category: "Shopping", type: "adjective" },
    { darija: "Msdod", french: "Fermé", english: "Closed", category: "Shopping", type: "adjective" },

    // ===== TIME (from PDF) =====
    { darija: "ShHal f sa3a?", french: "Quelle heure est-il?", english: "What time is it?", category: "Time", type: "question" },
    { darija: "Hadi tlata nishan", french: "Il est trois heures pile", english: "It is three exactly", category: "Time", type: "phrase" },
    { darija: "Baqi lHal", french: "Il est tôt", english: "It is early", category: "Time", type: "phrase" },
    { darija: "Msha lHal", french: "Il est tard", english: "It is late", category: "Time", type: "phrase" },
    { darija: "SmH liya t3atlt", french: "Désolé pour le retard", english: "Sorry for being late", category: "Time", type: "phrase" },
    { darija: "F lwaqt", french: "À l'heure", english: "On time", category: "Time", type: "phrase" },
    { darija: "Daba", french: "Maintenant", english: "Now", category: "Time", type: "adverb" },
    { darija: "Lyom", french: "Aujourd'hui", english: "Today", category: "Time", type: "adverb" },
    { darija: "Ghdda", french: "Demain", english: "Tomorrow", category: "Time", type: "adverb" },
    { darija: "lbraH", french: "Hier", english: "Yesterday", category: "Time", type: "adverb" },
    { darija: "WaHd shwiya", french: "Dans un moment", english: "In a little bit", category: "Time", type: "phrase" },
    { darija: "Mn ba3d", french: "Plus tard", english: "Later", category: "Time", type: "adverb" },
    { darija: "SbaH", french: "Matin", english: "Morning", category: "Time", type: "noun" },
    { darija: "L3shiya", french: "Après-midi", english: "Afternoon", category: "Time", type: "noun" },
    { darija: "Llil", french: "Nuit", english: "Night", category: "Time", type: "noun" },
    { darija: "Dqiqa", french: "Minute", english: "Minute", category: "Time", type: "noun" },
    { darija: "Sa3a", french: "Heure", english: "Hour", category: "Time", type: "noun" },
    { darija: "Simana", french: "Semaine", english: "Week", category: "Time", type: "noun" },
    { darija: "Shhr", french: "Mois", english: "Month", category: "Time", type: "noun" },
    { darija: "3am", french: "Année", english: "Year", category: "Time", type: "noun" },

    // ===== DAYS (from PDF) =====
    { darija: "Nhar lHd", french: "Dimanche", english: "Sunday", category: "Days", type: "noun" },
    { darija: "Nhar tniyn", french: "Lundi", english: "Monday", category: "Days", type: "noun" },
    { darija: "Nhar tlat", french: "Mardi", english: "Tuesday", category: "Days", type: "noun" },
    { darija: "Nhar larb3", french: "Mercredi", english: "Wednesday", category: "Days", type: "noun" },
    { darija: "Nhar lkhmis", french: "Jeudi", english: "Thursday", category: "Days", type: "noun" },
    { darija: "Nhar jm3a", french: "Vendredi", english: "Friday", category: "Days", type: "noun" },
    { darija: "Nhar ssbt", french: "Samedi", english: "Saturday", category: "Days", type: "noun" },

    // ===== NUMBERS (from PDF) =====
    { darija: "Wahd", french: "Un", english: "1 / One", category: "Numbers", type: "number" },
    { darija: "Juj", french: "Deux", english: "2 / Two", category: "Numbers", type: "number" },
    { darija: "Tlata", french: "Trois", english: "3 / Three", category: "Numbers", type: "number" },
    { darija: "Rb3a", french: "Quatre", english: "4 / Four", category: "Numbers", type: "number" },
    { darija: "Khmsa", french: "Cinq", english: "5 / Five", category: "Numbers", type: "number" },
    { darija: "Stta", french: "Six", english: "6 / Six", category: "Numbers", type: "number" },
    { darija: "Sb3a", french: "Sept", english: "7 / Seven", category: "Numbers", type: "number" },
    { darija: "Tmanya", french: "Huit", english: "8 / Eight", category: "Numbers", type: "number" },
    { darija: "Ts3od", french: "Neuf", english: "9 / Nine", category: "Numbers", type: "number" },
    { darija: "3ashra", french: "Dix", english: "10 / Ten", category: "Numbers", type: "number" },
    { darija: "Hda3sh", french: "Onze", english: "11 / Eleven", category: "Numbers", type: "number" },
    { darija: "Tna3sh", french: "Douze", english: "12 / Twelve", category: "Numbers", type: "number" },
    { darija: "3shrin", french: "Vingt", english: "20 / Twenty", category: "Numbers", type: "number" },
    { darija: "Tlatin", french: "Trente", english: "30 / Thirty", category: "Numbers", type: "number" },
    { darija: "Rb3in", french: "Quarante", english: "40 / Forty", category: "Numbers", type: "number" },
    { darija: "Khamsin", french: "Cinquante", english: "50 / Fifty", category: "Numbers", type: "number" },
    { darija: "Sttin", french: "Soixante", english: "60 / Sixty", category: "Numbers", type: "number" },
    { darija: "Sb3in", french: "Soixante-dix", english: "70 / Seventy", category: "Numbers", type: "number" },
    { darija: "Tmanyin", french: "Quatre-vingts", english: "80 / Eighty", category: "Numbers", type: "number" },
    { darija: "Ts3in", french: "Quatre-vingt-dix", english: "90 / Ninety", category: "Numbers", type: "number" },
    { darija: "Myya", french: "Cent", english: "100 / One hundred", category: "Numbers", type: "number" },
    { darija: "Alf", french: "Mille", english: "1000 / One thousand", category: "Numbers", type: "number" },

    // ===== MONEY (from PDF) =====
    { darija: "Lflos", french: "Argent", english: "Money", category: "Money", type: "noun" },
    { darija: "Riyal", french: "Riyal", english: "Riyal (20 riyals = 1 dirham)", category: "Money", type: "noun" },
    { darija: "Dirham", french: "Dirham", english: "Dirham (Moroccan currency)", category: "Money", type: "noun" },
    { darija: "Frank", french: "Franc", english: "Frank (100 franks = 1 dirham)", category: "Money", type: "noun" },
    { darija: "Ssrf", french: "Monnaie", english: "Change", category: "Money", type: "noun" },
    { darija: "Srrf liya 3afak", french: "Donne-moi la monnaie s'il te plaît", english: "Give me change please", category: "Money", type: "phrase" },

    // ===== PRONOUNS (Enhanced) =====
    { 
      darija: "ana", 
      french: "Je/Moi", 
      english: "I/Me", 
      category: "Pronouns",
      type: "pronoun",
      pronunciation: "ah-nah",
      definition: "First person singular pronoun used to refer to oneself.",
      examples: [
        { darija: "ana mshit l lmadrasa", arabic: "أنا مشيت للمدرسة", french: "Je suis allé à l'école", english: "I went to school" },
        { darija: "ana kankhdem f restaurant", arabic: "أنا كنخدم في رستورونت", french: "Je travaille dans un restaurant", english: "I work in a restaurant" }
      ],
      relatedWords: ["nta", "nti", "howa", "hiya", "7na", "ntuma", "huma"]
    },
    { darija: "nta", french: "Tu/Toi (m)", english: "You (masculine)", category: "Pronouns", type: "pronoun", pronunciation: "n-tah" },
    { darija: "nti", french: "Tu/Toi (f)", english: "You (feminine)", category: "Pronouns", type: "pronoun", pronunciation: "n-tee" },
    { darija: "howa", french: "Il/Lui", english: "He/Him", category: "Pronouns", type: "pronoun", pronunciation: "hoo-wah" },
    { darija: "hiya", french: "Elle", english: "She/Her", category: "Pronouns", type: "pronoun", pronunciation: "hee-yah" },
    { darija: "7na", french: "Nous", english: "We/Us", category: "Pronouns", type: "pronoun", pronunciation: "h-nah" },
    { darija: "ntuma", french: "Vous", english: "You (plural)", category: "Pronouns", type: "pronoun", pronunciation: "n-too-mah" },
    { darija: "huma", french: "Ils/Elles", english: "They/Them", category: "Pronouns", type: "pronoun", pronunciation: "hoo-mah" },

    // ===== COMMON VERBS =====
    { darija: "msha", french: "Aller", english: "To go", category: "Verbs", type: "verb", example: "Ghadi nmshi lsouq (I'm going to the market)" },
    { darija: "ja", french: "Venir", english: "To come", category: "Verbs", type: "verb", example: "Aji hna (Come here)" },
    { darija: "kla", french: "Manger", english: "To eat", category: "Verbs", type: "verb", example: "Bghit nakol (I want to eat)" },
    { darija: "shreb", french: "Boire", english: "To drink", category: "Verbs", type: "verb", example: "Kanshreb atay (I'm drinking tea)" },
    { darija: "shaf", french: "Voir", english: "To see", category: "Verbs", type: "verb", example: "Sheft lfilm (I saw the movie)" },
    { darija: "sma3", french: "Entendre", english: "To hear", category: "Verbs", type: "verb", example: "Sma3ti? (Did you hear?)" },
    { darija: "hdar", french: "Parler", english: "To speak", category: "Verbs", type: "verb", example: "Kayhder b darija (He speaks Darija)" },
    { darija: "fhem", french: "Comprendre", english: "To understand", category: "Verbs", type: "verb", example: "Fhemt kolshi (I understood everything)" },
    { darija: "bga", french: "Vouloir", english: "To want", category: "Verbs", type: "verb", example: "Bghit nmshi (I want to go)" },
    { darija: "3ref", french: "Savoir", english: "To know", category: "Verbs", type: "verb", example: "Ma 3reftsh (I don't know)" },
    { darija: "dar", french: "Faire", english: "To do/make", category: "Verbs", type: "verb", example: "Ash kadir? (What are you doing?)" },
    { darija: "khdem", french: "Travailler", english: "To work", category: "Verbs", type: "verb", example: "Kankhdem f sherka (I work in a company)" },
    { darija: "qra", french: "Lire/Étudier", english: "To read/study", category: "Verbs", type: "verb", example: "Kanqra l3arabiya (I'm studying Arabic)" },
    { darija: "kteb", french: "Écrire", english: "To write", category: "Verbs", type: "verb", example: "Kteb liya (Write to me)" },
    { darija: "n3es", french: "Dormir", english: "To sleep", category: "Verbs", type: "verb", example: "Bghit nn3es (I want to sleep)" },

    // ===== QUESTIONS =====
    { darija: "shkoun?", french: "Qui?", english: "Who?", category: "Questions", example: "Shkoun hada? (Who is this?)" },
    { darija: "ash?", french: "Quoi?", english: "What?", category: "Questions", example: "Ash kadir? (What are you doing?)" },
    { darija: "fin?", french: "Où?", english: "Where?", category: "Questions", example: "Fin ghadi? (Where are you going?)" },
    { darija: "fuqash?", french: "Quand?", english: "When?", category: "Questions", example: "Fuqash ghadi tji? (When will you come?)" },
    { darija: "3lash?", french: "Pourquoi?", english: "Why?", category: "Questions", example: "3lash ma jitish? (Why didn't you come?)" },
    { darija: "kifash?", french: "Comment?", english: "How?", category: "Questions", example: "Kifash drti hada? (How did you do this?)" },
    { darija: "shhal?", french: "Combien?", english: "How much/many?", category: "Questions", example: "Shhal hadi? (How much is this?)" },
    { darija: "wash?", french: "Est-ce que?", english: "Is it?/Do you?", category: "Questions", example: "Wash ghadi tji? (Will you come?)" },

    // ===== DIRECTIONS =====
    { darija: "limen", french: "À droite", english: "Right", category: "Directions", example: "Sir limen (Go right)" },
    { darija: "liser", french: "À gauche", english: "Left", category: "Directions", example: "Dour liser (Turn left)" },
    { darija: "nishane", french: "Tout droit", english: "Straight", category: "Directions", example: "Mshi nishane (Go straight)" },
    { darija: "fuq", french: "En haut", english: "Up/Above", category: "Directions" },
    { darija: "taht", french: "En bas", english: "Down/Below", category: "Directions" },
    { darija: "hda", french: "À côté de", english: "Next to", category: "Directions" },
    { darija: "qdam", french: "Devant", english: "In front of", category: "Directions" },
    { darija: "mora", french: "Derrière", english: "Behind", category: "Directions" },
    { darija: "b3id", french: "Loin", english: "Far", category: "Directions" },
    { darija: "qrib", french: "Près", english: "Near", category: "Directions" },

    // ===== TRANSPORTATION =====
    { darija: "tomobil", french: "Voiture", english: "Car", category: "Transportation" },
    { darija: "taxi", french: "Taxi", english: "Taxi", category: "Transportation" },
    { darija: "tran", french: "Train", english: "Train", category: "Transportation" },
    { darija: "tobis", french: "Bus", english: "Bus", category: "Transportation" },
    { darija: "tiyara", french: "Avion", english: "Airplane", category: "Transportation" },
    { darija: "motor", french: "Moto", english: "Motorcycle", category: "Transportation" },
    { darija: "basklit", french: "Vélo", english: "Bicycle", category: "Transportation" },

    // ===== PLACES =====
    { darija: "dar", french: "Maison", english: "House/Home", category: "Places" },
    { darija: "souq", french: "Marché", english: "Market", category: "Places" },
    { darija: "mdina", french: "Ville", english: "City", category: "Places" },
    { darija: "sbitar", french: "Hôpital", english: "Hospital", category: "Places" },
    { darija: "jam3a", french: "Université", english: "University", category: "Places" },
    { darija: "madrasa", french: "École", english: "School", category: "Places" },
    { darija: "jame3", french: "Mosquée", english: "Mosque", category: "Places" },

    // ===== COLORS =====
    { darija: "hmar", french: "Rouge", english: "Red", category: "Colors" },
    { darija: "khal", french: "Noir", english: "Black", category: "Colors" },
    { darija: "byad", french: "Blanc", english: "White", category: "Colors" },
    { darija: "khdar", french: "Vert", english: "Green", category: "Colors" },
    { darija: "zreq", french: "Bleu", english: "Blue", category: "Colors" },
    { darija: "sfer", french: "Jaune", english: "Yellow", category: "Colors" },

    // ===== EMOTIONS =====
    { darija: "fer7an", french: "Content/Heureux", english: "Happy", category: "Emotions" },
    { darija: "mred", french: "Malade", english: "Sick", category: "Emotions" },
    { darija: "3yan", french: "Fatigué", english: "Tired", category: "Emotions" },
    { darija: "za3fan", french: "En colère", english: "Angry", category: "Emotions" },
    { darija: "khayef", french: "Peur", english: "Afraid/Scared", category: "Emotions" },

    // ===== EXPRESSIONS =====
    { darija: "inshallah", french: "Si Dieu veut", english: "God willing", category: "Expressions" },
    { darija: "mabrouk", french: "Félicitations", english: "Congratulations", category: "Expressions" },
    { darija: "bsaha", french: "Bon appétit", english: "Enjoy your meal", category: "Expressions" },
    { darija: "allah y3awnek", french: "Que Dieu t'aide", english: "May God help you", category: "Expressions" },
    { darija: "ma3lich", french: "Pas grave", english: "No problem/Never mind", category: "Expressions" },
    { darija: "baraka allah fik", french: "Que Dieu te bénisse", english: "God bless you", category: "Expressions" },
    { darija: "yallah", french: "Allez/Viens", english: "Let's go/Come on", category: "Expressions" }
  ];

  const filteredEntries = dictionaryEntries.filter(
    entry =>
      entry.darija.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.example && entry.example.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group by category
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, typeof dictionaryEntries>);

  // Define category order for better organization
  const categoryOrder = [
    "Essentials", "Greetings", "First Encounters", "Politeness", "Questions",
    "Food & Drinks", "Guesthouse", "Family", "Nature", "Weather", "Hiking",
    "Shopping", "Money", "Time", "Days", "Numbers", "Transportation", "Directions",
    "Places", "Pronouns", "Verbs", "Nouns", "Adjectives", "Colors", "Emotions",
    "Expressions", "Common", "Body", "Objects", "Actions", "Descriptions", "States"
  ];

  const categories = Object.keys(groupedEntries).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handlePlayAudio = (text: string, languageName: string) => {
    if (!text?.trim()) {
      toast.error("No text to speak");
      return;
    }
    
    const languageCodes: Record<string, string> = {
      Darija: "ar-MA",
      Arabic: "ar-SA",
      French: "fr-FR",
      English: "en-US",
    };

    try {
      window.speechSynthesis.cancel();
      const langCode = languageCodes[languageName] || "en-US";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const baseLang = langCode.split("-")[0].toLowerCase();
      const voice = availableVoices.find(v => v.lang.toLowerCase().startsWith(baseLang));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => toast.success("Playing audio");
      utterance.onerror = () => toast.error("Speech error");
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      toast.error("Failed to play audio");
    }
  };

  const handleWordClick = (entry: DictionaryEntry) => {
    setSelectedWord(entry);
    setDialogOpen(true);
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category] || defaultCategory;
  };

  return (
    <>
      <Helmet>
        <title>Darija Dictionary - Moroccan Arabic Words & Phrases | Tarjama</title>
        <meta name="description" content="Comprehensive Darija dictionary with pronunciations, examples, and translations. Learn Moroccan Arabic vocabulary with detailed explanations in French and English." />
        <link rel="canonical" href="https://tarjama.lovable.app/dictionary" />
        <meta property="og:title" content="Darija Dictionary - Moroccan Arabic Words & Phrases | Tarjama" />
        <meta property="og:description" content="Comprehensive Darija dictionary with pronunciations, examples, and translations. Learn Moroccan Arabic vocabulary with detailed explanations in French and English." />
        <meta property="og:url" content="https://tarjama.lovable.app/dictionary" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ZelligeCorners size="md" opacity={0.35} />
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={tarjamaLogo} alt="Tarjama Logo" className="w-12 h-12 sm:w-14 sm:h-14" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('dictionary.title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('dictionary.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog selectedVoice="" setSelectedVoice={() => {}} availableVoices={[]} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button variant="default" size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
              {t('navigation.backToTranslator')}
            </Button>
          </Link>
            <Link to="/dictionary/faq">
              <Button variant="outline" size="lg" className="gap-2 shadow-md hover:shadow-lg transition-all">
                <MessageCircle className="w-5 h-5" />
                FAQ
              </Button>
            </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-primary">{dictionaryEntries.length}+</p>
              <p className="text-sm text-muted-foreground mt-2">{t('dictionary.totalWords')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-secondary">{categories.length}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('dictionary.categories')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-accent">100%</p>
              <p className="text-sm text-muted-foreground mt-2">{t('dictionary.accuracy')}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t('dictionary.searchTitle')}</CardTitle>
            <CardDescription>{t('dictionary.searchDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder={t('dictionary.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-10">
          {categories.map((category) => {
            const config = getCategoryConfig(category);
            const IconComponent = config.icon;
            
            return (
              <div key={category} className="space-y-4">
                {/* Category Header with Icon and Theme */}
                <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${config.gradient} border ${config.borderColor}`}>
                  <div className={`p-3 rounded-lg bg-card shadow-md ${config.iconColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {category}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {groupedEntries[category].length} {groupedEntries[category].length === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {groupedEntries[category].map((entry, index) => (
                    <Card 
                      key={`${category}-${index}`} 
                      className={`hover:shadow-elegant transition-all duration-300 border-l-4 ${config.borderColor} cursor-pointer hover:scale-[1.01]`}
                      onClick={() => handleWordClick(entry)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-2xl font-bold text-primary">{entry.darija}</span>
                              <span className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r ${config.gradient} ${config.iconColor} font-medium border ${config.borderColor}`}>
                                {entry.category}
                              </span>
                              {entry.type && (
                                <span className="px-2 py-0.5 text-xs rounded bg-secondary/20 text-secondary-foreground">
                                  {entry.type}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2 text-muted-foreground">
                              <p className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-lg">🇫🇷</span>
                                <span className="text-base">{entry.french}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-lg">🇬🇧</span>
                                <span className="text-base">{entry.english}</span>
                              </p>
                            </div>
                            {entry.example && (
                              <div className="mt-3 pt-3 border-t border-border/30">
                                <p className="text-sm text-muted-foreground italic">
                                  <span className="font-semibold text-foreground not-italic">Example: </span>
                                  {entry.example}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{t('dictionary.noResults')}</p>
            </CardContent>
          </Card>
        )}
      </main>

      <WordDetailDialog 
        word={selectedWord}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPlayAudio={handlePlayAudio}
      />
    </div>
    </>
  );
};

export default Dictionary;
