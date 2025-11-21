import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";

interface DictionaryEntry {
  darija: string;
  french: string;
  english: string;
  category: string;
  example?: string;
}

const Dictionary = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const dictionaryEntries = [
    // Greetings & Politeness
    { darija: "salam", french: "Bonjour/Salut", english: "Hello", category: "Greetings", example: "Salam, kif dayr? (Hi, how are you?)" },
    { darija: "sbah lkhir", french: "Bonjour (matin)", english: "Good morning", category: "Greetings", example: "Sbah lkhir, nmti mezyan? (Good morning, did you sleep well?)" },
    { darija: "msa lkhir", french: "Bonsoir", english: "Good evening", category: "Greetings", example: "Msa lkhir, labas 3lik? (Good evening, how are you?)" },
    { darija: "bslama", french: "Au revoir", english: "Goodbye", category: "Greetings", example: "Bslama, nchoufek ghedda (Goodbye, see you tomorrow)" },
    { darija: "beslama", french: "Au revoir", english: "Goodbye", category: "Greetings", example: "Beslama, sir b salama (Goodbye, go safely)" },
    { darija: "shokran", french: "Merci", english: "Thank you", category: "Politeness", example: "Shokran bezaf 3la lmosa3ada (Thank you very much for the help)" },
    { darija: "3afak", french: "S'il te plaît", english: "Please", category: "Politeness", example: "3afak 3tini lma (Please give me water)" },
    { darija: "smehli", french: "Excuse-moi", english: "Excuse me/Sorry", category: "Politeness", example: "Smehli, ma fhemteksh (Sorry, I didn't understand you)" },
    { darija: "layhfdek", french: "Au revoir (que Dieu te protège)", english: "Goodbye (may God protect you)", category: "Greetings", example: "Layhfdek, sir mezyan (Goodbye, go well)" },
    { darija: "kif dayr?", french: "Comment vas-tu?", english: "How are you? (m)", category: "Greetings", example: "Salam, kif dayr? (Hi, how are you?)" },
    { darija: "kif dayra?", french: "Comment vas-tu?", english: "How are you? (f)", category: "Greetings", example: "Ahlan, kif dayra? (Hello, how are you?)" },
    { darija: "labas", french: "Ça va", english: "I'm fine", category: "Greetings", example: "Labas, hamdolah (I'm fine, thank God)" },
    { darija: "bikhir", french: "Ça va bien", english: "I'm good", category: "Greetings", example: "Ana bikhir, wash nta? (I'm good, and you?)" },
    { darija: "hamdolah", french: "Dieu merci", english: "Thank God", category: "Greetings", example: "Kif dayr? Hamdolah labas (How are you? Thank God I'm fine)" },
    
    // Common Expressions
    { darija: "wakha", french: "D'accord", english: "Okay/Alright", category: "Common", example: "Wakha, ghadi njik m3ak (Okay, I'll come with you)" },
    { darija: "wah", french: "Oui", english: "Yes", category: "Common", example: "Wah, hada sahih (Yes, that's correct)" },
    { darija: "la", french: "Non", english: "No", category: "Common", example: "La, mashi hadshi li bghit (No, that's not what I want)" },
    { darija: "ewa", french: "Alors/Donc", english: "So/Well", category: "Common", example: "Ewa, ash khbark? (So, what's your news?)" },
    { darija: "ma3reftsh", french: "Je ne sais pas", english: "I don't know", category: "Common", example: "Ma3reftsh fin howa (I don't know where he is)" },
    { darija: "fhemt", french: "J'ai compris", english: "I understood", category: "Common", example: "Ah, fhemt daba (Ah, I understand now)" },
    { darija: "ma fhemtsh", french: "Je n'ai pas compris", english: "I didn't understand", category: "Common", example: "Smehli, ma fhemtsh (Sorry, I didn't understand)" },
    { darija: "safi", french: "C'est bon/Ça suffit", english: "That's enough/It's done", category: "Common", example: "Safi, khlas daba (That's it, it's finished now)" },
    { darija: "mezyan", french: "Bien/Bon", english: "Good/Fine", category: "Common", example: "Hadshi mezyan bezaf (This is very good)" },
    { darija: "mzyan", french: "Bien", english: "Good", category: "Common", example: "Kolshi mzyan (Everything is good)" },
    { darija: "mashi mzyan", french: "Pas bien", english: "Not good", category: "Common", example: "Hada mashi mzyan (This is not good)" },
    { darija: "yallah", french: "Allez/Viens", english: "Let's go/Come on", category: "Common", example: "Yallah, khssna nemshiw (Come on, we need to go)" },
    { darija: "baraka", french: "Assez/Ça suffit", english: "Enough", category: "Common", example: "Baraka, ma bghitsh (Enough, I don't want anymore)" },
    { darija: "bezzaf", french: "Beaucoup", english: "A lot/Very", category: "Common", example: "Shokran bezzaf (Thank you very much)" },
    { darija: "shwiya", french: "Un peu", english: "A little", category: "Common", example: "Shwiya dyal lma 3afak (A little water please)" },
    { darija: "daba", french: "Maintenant", english: "Now", category: "Time", example: "Daba ghadi njik (I'm coming now)" },
    { darija: "ghedda", french: "Demain", english: "Tomorrow", category: "Time", example: "Ghedda nchoufek (See you tomorrow)" },
    { darija: "lbareh", french: "Hier", english: "Yesterday", category: "Time", example: "Sheft lbareh (I saw him yesterday)" },
    
    // Questions
    { darija: "shkoun?", french: "Qui?", english: "Who?", category: "Questions", example: "Shkoun hada? (Who is this?)" },
    { darija: "ash?", french: "Quoi?", english: "What?", category: "Questions", example: "Ash kadir? (What are you doing?)" },
    { darija: "fin?", french: "Où?", english: "Where?", category: "Questions", example: "Fin ghadi? (Where are you going?)" },
    { darija: "fuqash?", french: "Quand?", english: "When?", category: "Questions", example: "Fuqash ghadi tji? (When will you come?)" },
    { darija: "3lash?", french: "Pourquoi?", english: "Why?", category: "Questions", example: "3lash ma jitish? (Why didn't you come?)" },
    { darija: "kifash?", french: "Comment?", english: "How?", category: "Questions", example: "Kifash drti hada? (How did you do this?)" },
    { darija: "shhal?", french: "Combien?", english: "How much/many?", category: "Questions", example: "Shhal hadi? (How much is this?)" },
    { darija: "wash?", french: "Est-ce que?", english: "Is it?/Do you?", category: "Questions", example: "Wash ghadi tji m3ana? (Will you come with us?)" },
    
    // Numbers
    { darija: "wahed", french: "Un", english: "One", category: "Numbers", example: "Wahed dyal lqahwa 3afak (One coffee please)" },
    { darija: "jouj", french: "Deux", english: "Two", category: "Numbers", example: "Jouj dyal atay (Two teas)" },
    { darija: "tlata", french: "Trois", english: "Three", category: "Numbers", example: "Tlata dyal drari (Three children)" },
    { darija: "reb3a", french: "Quatre", english: "Four", category: "Numbers", example: "Reb3a dyour (Four houses)" },
    { darija: "khamsa", french: "Cinq", english: "Five", category: "Numbers", example: "Khamsa dyial (Five dirhams)" },
    { darija: "setta", french: "Six", english: "Six", category: "Numbers", example: "Setta sa3at (Six hours)" },
    { darija: "seb3a", french: "Sept", english: "Seven", category: "Numbers", example: "Seb3a snin (Seven years)" },
    { darija: "tmanya", french: "Huit", english: "Eight", category: "Numbers", example: "Tmanya drari (Eight kids)" },
    { darija: "tes3oud", french: "Neuf", english: "Nine", category: "Numbers", example: "Tes3oud shhor (Nine months)" },
    { darija: "3ashra", french: "Dix", english: "Ten", category: "Numbers", example: "3ashra dirhams (Ten dirhams)" },
    
    // Family
    { darija: "baba", french: "Papa", english: "Dad/Father", category: "Family", example: "Baba f lkhdma (Dad is at work)" },
    { darija: "mama", french: "Maman", english: "Mom/Mother", category: "Family", example: "Mama tayba (Mom is cooking)" },
    { darija: "khouya", french: "Mon frère", english: "My brother", category: "Family", example: "Khouya sghir mnni (My brother is younger than me)" },
    { darija: "khouti", french: "Mes frères", english: "My brothers", category: "Family", example: "Khouti f lmadina (My brothers are in the city)" },
    { darija: "khti", french: "Ma sœur", english: "My sister", category: "Family", example: "Khti qrat f jam3a (My sister studied at university)" },
    { darija: "weld", french: "Fils/Garçon", english: "Son/Boy", category: "Family", example: "Weld seghir (Small boy)" },
    { darija: "bent", french: "Fille", english: "Daughter/Girl", category: "Family", example: "Bent kbira (Big girl)" },
    { darija: "drari", french: "Enfants", english: "Children", category: "Family", example: "Drari l3bin f zenqa (Children playing in the street)" },
    { darija: "rajel", french: "Mari/Homme", english: "Husband/Man", category: "Family", example: "Rajli f lbit (My husband is at home)" },
    { darija: "mra", french: "Femme/Épouse", english: "Wife/Woman", category: "Family", example: "Mrati tayba (My wife is cooking)" },
    
    // Food & Drinks
    { darija: "lma", french: "Eau", english: "Water", category: "Food & Drinks", example: "3tini lma 3afak (Give me water please)" },
    { darija: "atay", french: "Thé", english: "Tea", category: "Food & Drinks", example: "Bghit atay b na3na3 (I want mint tea)" },
    { darija: "qahwa", french: "Café", english: "Coffee", category: "Food & Drinks", example: "Qahwa s-khuna 3afak (Hot coffee please)" },
    { darija: "hlib", french: "Lait", english: "Milk", category: "Food & Drinks", example: "Hlib skhar (Hot milk)" },
    { darija: "khobz", french: "Pain", english: "Bread", category: "Food & Drinks", example: "Khobz ska (Round bread)" },
    { darija: "lham", french: "Viande", english: "Meat", category: "Food & Drinks", example: "Lham dyal bgri (Beef)" },
    { darija: "dajaj", french: "Poulet", english: "Chicken", category: "Food & Drinks", example: "Dajaj mshwi (Grilled chicken)" },
    { darija: "hout", french: "Poisson", english: "Fish", category: "Food & Drinks", example: "Hout tari (Fresh fish)" },
    { darija: "khodra", french: "Légumes", english: "Vegetables", category: "Food & Drinks", example: "Khodra tayba (Cooked vegetables)" },
    { darija: "fakya", french: "Fruits", english: "Fruits", category: "Food & Drinks", example: "Fakya tayba (Ripe fruits)" },
    { darija: "teffah", french: "Pomme", english: "Apple", category: "Food & Drinks", example: "Teffah hmar (Red apple)" },
    { darija: "lbrtqal", french: "Orange", english: "Orange", category: "Food & Drinks", example: "3asir lbrtqal (Orange juice)" },
    
    // Common Verbs
    { darija: "msha", french: "Aller", english: "To go", category: "Verbs", example: "Ghadi nmshi lsouq (I'm going to the market)" },
    { darija: "ja", french: "Venir", english: "To come", category: "Verbs", example: "Aji hna (Come here)" },
    { darija: "kla", french: "Manger", english: "To eat", category: "Verbs", example: "Bghit nakol (I want to eat)" },
    { darija: "shreb", french: "Boire", english: "To drink", category: "Verbs", example: "Kanshreb atay (I'm drinking tea)" },
    { darija: "shaf", french: "Voir", english: "To see", category: "Verbs", example: "Sheft lfilm (I saw the movie)" },
    { darija: "sme3", french: "Entendre", english: "To hear", category: "Verbs", example: "Sme3ti? (Did you hear?)" },
    { darija: "hdar", french: "Parler", english: "To speak", category: "Verbs", example: "Kayhder b darija (He speaks Darija)" },
    { darija: "fhem", french: "Comprendre", english: "To understand", category: "Verbs", example: "Fhemt kolshi (I understood everything)" },
    { darija: "bga", french: "Vouloir", english: "To want", category: "Verbs", example: "Bghit nmshi (I want to go)" },
    { darija: "3ref", french: "Savoir/Connaître", english: "To know", category: "Verbs", example: "Ma 3reftsh (I don't know)" },
    { darija: "dar", french: "Faire", english: "To do/make", category: "Verbs", example: "Ash kadir? (What are you doing?)" },
    { darija: "khdem", french: "Travailler", english: "To work", category: "Verbs", example: "Kankhdem f sherka (I work in a company)" },
    { darija: "qra", french: "Lire/Étudier", english: "To read/study", category: "Verbs", example: "Kanqra l3arabiya (I'm studying Arabic)" },
    { darija: "kteb", french: "Écrire", english: "To write", category: "Verbs", example: "Kteb liya (Write to me)" },
    { darija: "n3es", french: "Dormir", english: "To sleep", category: "Verbs", example: "Bghit nn3es (I want to sleep)" },
    
    // Adjectives
    { darija: "kbir", french: "Grand", english: "Big", category: "Adjectives", example: "Dar kbira (Big house)" },
    { darija: "sghir", french: "Petit", english: "Small", category: "Adjectives", example: "Weld sghir (Small boy)" },
    { darija: "jdid", french: "Nouveau", english: "New", category: "Adjectives", example: "Tomobil jdida (New car)" },
    { darija: "qdim", french: "Vieux", english: "Old", category: "Adjectives", example: "Mdina qdima (Old city)" },
    { darija: "zwin", french: "Beau/Joli", english: "Beautiful/Pretty", category: "Adjectives", example: "Bent zwina (Beautiful girl)" },
    { darija: "qbih", french: "Laid", english: "Ugly", category: "Adjectives", example: "Manzar qbih (Ugly view)" },
    { darija: "s-khoun", french: "Chaud", english: "Hot", category: "Adjectives", example: "Lma s-khoun (Hot water)" },
    { darija: "bared", french: "Froid", english: "Cold", category: "Adjectives", example: "Jaw bared (Cold weather)" },
    { darija: "ghali", french: "Cher", english: "Expensive", category: "Adjectives", example: "Hadshi ghali bezzaf (This is very expensive)" },
    { darija: "rkhis", french: "Bon marché", english: "Cheap", category: "Adjectives", example: "Tomobil rkhisa (Cheap car)" },
    { darija: "hlou", french: "Doux/Sucré", english: "Sweet", category: "Adjectives", example: "Atay hlou (Sweet tea)" },
    { darija: "mer", french: "Amer", english: "Bitter", category: "Adjectives", example: "Qahwa merra (Bitter coffee)" },
    
    // Places
    { darija: "dar", french: "Maison", english: "House/Home", category: "Places", example: "Ghadi l dar (Going home)" },
    { darija: "bit", french: "Chambre/Maison", english: "Room/House", category: "Places", example: "F lbit (At home)" },
    { darija: "souq", french: "Marché", english: "Market", category: "Places", example: "Ghadi l souq (Going to the market)" },
    { darija: "mdina", french: "Ville", english: "City", category: "Places", example: "Mdina kbira (Big city)" },
    { darija: "triq", french: "Route/Rue", english: "Road/Street", category: "Places", example: "Triq twila (Long road)" },
    { darija: "zenqa", french: "Rue", english: "Street", category: "Places", example: "Zenqa seghira (Small street)" },
    { darija: "sbitar", french: "Hôpital", english: "Hospital", category: "Places", example: "Msha l sbitar (He went to the hospital)" },
    { darija: "jam3a", french: "Université", english: "University", category: "Places", example: "Qrat f jam3a (She studied at university)" },
    { darija: "madrasa", french: "École", english: "School", category: "Places", example: "Drari f lmadrasa (Kids at school)" },
    { darija: "jame3", french: "Mosquée", english: "Mosque", category: "Places", example: "Ghadi l jame3 (Going to the mosque)" },
    
    // Body Parts
    { darija: "ras", french: "Tête", english: "Head", category: "Body", example: "Kaywajedni rasi (My head hurts)" },
    { darija: "3in", french: "Œil", english: "Eye", category: "Body", example: "3inek zwinin (Your eyes are beautiful)" },
    { darija: "yedd", french: "Main", english: "Hand", category: "Body", example: "Gsel yeddik (Wash your hands)" },
    { darija: "rejel", french: "Jambe/Pied", english: "Leg/Foot", category: "Body", example: "Rejli katwjedni (My leg hurts)" },
    { darija: "fom", french: "Bouche", english: "Mouth", category: "Body", example: "Sed fomek (Close your mouth)" },
    { darija: "odn", french: "Oreille", english: "Ear", category: "Body", example: "Ma sme3tsh b odnya (I didn't hear with my ear)" },
    { darija: "anf", french: "Nez", english: "Nose", category: "Body", example: "Anfi msdoud (My nose is blocked)" },
    
    // Weather & Nature
    { darija: "shems", french: "Soleil", english: "Sun", category: "Weather", example: "Shems sakna (The sun is hot)" },
    { darija: "qmar", french: "Lune", english: "Moon", category: "Weather", example: "Qmar mlih (Beautiful moon)" },
    { darija: "shta", french: "Pluie/Hiver", english: "Rain/Winter", category: "Weather", example: "Katetshta (It's raining)" },
    { darija: "rih", french: "Vent", english: "Wind", category: "Weather", example: "Rih qwiya (Strong wind)" },
    { darija: "berd", french: "Froid", english: "Cold", category: "Weather", example: "Lyoum berd (Today is cold)" },
    { darija: "shkara", french: "Chaleur", english: "Heat", category: "Weather", example: "Shkara kbira (Big heat)" },
    { darija: "bher", french: "Mer", english: "Sea", category: "Nature", example: "Mshit l bher (I went to the sea)" },
    { darija: "jbel", french: "Montagne", english: "Mountain", category: "Nature", example: "Jbel 3ali (High mountain)" },
    
    // Emotions & States
    { darija: "fer7an", french: "Content/Heureux", english: "Happy", category: "Emotions", example: "Ana fer7an bezzaf (I'm very happy)" },
    { darija: "mezyan", french: "Bien", english: "Fine/Good", category: "Emotions", example: "Ana mezyan (I'm fine)" },
    { darija: "mred", french: "Malade", english: "Sick", category: "Emotions", example: "Ana mred lyoum (I'm sick today)" },
    { darija: "3yan", french: "Fatigué", english: "Tired", category: "Emotions", example: "Ana 3yan bezzaf (I'm very tired)" },
    { darija: "za3fan", french: "En colère", english: "Angry", category: "Emotions", example: "3lash nta za3fan? (Why are you angry?)" },
    { darija: "khayef", french: "Peur", english: "Afraid/Scared", category: "Emotions", example: "Ana khayef (I'm scared)" },
    { darija: "je3", french: "Faim", english: "Hungry", category: "States", example: "Ana je3 (I'm hungry)" },
    { darija: "3tshan", french: "Soif", english: "Thirsty", category: "States", example: "Ana 3tshan (I'm thirsty)" },
    
    // Shopping & Money
    { darija: "tmen", french: "Prix", english: "Price", category: "Shopping", example: "Shhal tmen? (What's the price?)" },
    { darija: "flous", french: "Argent", english: "Money", category: "Shopping", example: "Ma 3endish flous (I don't have money)" },
    { darija: "dirham", french: "Dirham", english: "Dirham (currency)", category: "Shopping", example: "3ashra drahm (Ten dirhams)" },
    { darija: "shri", french: "Acheter", english: "To buy", category: "Shopping", example: "Bghit nshri hada (I want to buy this)" },
    { darija: "bi3", french: "Vendre", english: "To sell", category: "Shopping", example: "Kaybi3 khodra (He sells vegetables)" },
    
    // Colors
    { darija: "loun", french: "Couleur", english: "Color", category: "Colors", example: "Ash loun bghiti? (What color do you want?)" },
    { darija: "hmar", french: "Rouge", english: "Red", category: "Colors", example: "Tomobil hmra (Red car)" },
    { darija: "khal", french: "Noir", english: "Black", category: "Colors", example: "Serwal khal (Black pants)" },
    { darija: "byad", french: "Blanc", english: "White", category: "Colors", example: "Qamija byda (White shirt)" },
    { darija: "khdar", french: "Vert", english: "Green", category: "Colors", example: "Teffah khdar (Green apple)" },
    { darija: "zreq", french: "Bleu", english: "Blue", category: "Colors", example: "Sma zreqa (Blue sky)" },
    { darija: "sfer", french: "Jaune", english: "Yellow", category: "Colors", example: "Shems sefra (Yellow sun)" },
    { darija: "branj", french: "Orange", english: "Orange", category: "Colors", example: "Lbrtqal branj (Orange fruit)" },
    { darija: "rmadi", french: "Gris", english: "Gray", category: "Colors", example: "Sehab rmadi (Gray clouds)" },
    { darija: "wardi", french: "Rose", english: "Pink", category: "Colors", example: "Warda wardiya (Pink flower)" },
    
    // Directions & Places
    { darija: "limen", french: "À droite", english: "Right", category: "Directions", example: "Sir limen (Go right)" },
    { darija: "liser", french: "À gauche", english: "Left", category: "Directions", example: "Dour liser (Turn left)" },
    { darija: "nishane", french: "Tout droit", english: "Straight", category: "Directions", example: "Mshi nishane (Go straight)" },
    { darija: "fuq", french: "En haut", english: "Up/Above", category: "Directions", example: "Fuq dar (Above the house)" },
    { darija: "taht", french: "En bas", english: "Down/Below", category: "Directions", example: "Taht tabla (Under the table)" },
    { darija: "hda", french: "À côté de", english: "Next to", category: "Directions", example: "Hda sbitar (Next to the hospital)" },
    { darija: "qdam", french: "Devant", english: "In front of", category: "Directions", example: "Qdam jame3 (In front of the mosque)" },
    { darija: "mora", french: "Derrière", english: "Behind", category: "Directions", example: "Mora souq (Behind the market)" },
    { darija: "b3id", french: "Loin", english: "Far", category: "Directions", example: "B3id bezzaf (Very far)" },
    { darija: "qrib", french: "Près", english: "Near", category: "Directions", example: "Qrib men hna (Near here)" },
    
    // Transportation
    { darija: "tomobil", french: "Voiture", english: "Car", category: "Transportation", example: "Tomobil jdida (New car)" },
    { darija: "taxi", french: "Taxi", english: "Taxi", category: "Transportation", example: "Khod taxi (Take a taxi)" },
    { darija: "tran", french: "Train", english: "Train", category: "Transportation", example: "Tran mezyan (Good train)" },
    { darija: "tobis", french: "Bus", english: "Bus", category: "Transportation", example: "Tobis msha (The bus left)" },
    { darija: "tiyara", french: "Avion", english: "Airplane", category: "Transportation", example: "Tiyara f sma (Plane in the sky)" },
    { darija: "motor", french: "Moto", english: "Motorcycle", category: "Transportation", example: "Motor sghir (Small motorcycle)" },
    { darija: "basklit", french: "Vélo", english: "Bicycle", category: "Transportation", example: "Kayseq basklit (He rides a bike)" },
    { darija: "mahaṭṭa", french: "Gare/Station", english: "Station", category: "Transportation", example: "Mahatta dyal tran (Train station)" },
    { darija: "matar", french: "Aéroport", english: "Airport", category: "Transportation", example: "Ghadi l matar (Going to the airport)" },
    
    // Time & Days
    { darija: "lyoum", french: "Aujourd'hui", english: "Today", category: "Time", example: "Lyoum berd (Today is cold)" },
    { darija: "ghedda", french: "Demain", english: "Tomorrow", category: "Time", example: "Ghedda nchoufek (See you tomorrow)" },
    { darija: "lbareh", french: "Hier", english: "Yesterday", category: "Time", example: "Lbareh jit (I came yesterday)" },
    { darija: "sa3a", french: "Heure", english: "Hour/Time", category: "Time", example: "Shhal sa3a? (What time is it?)" },
    { darija: "dqiqa", french: "Minute", english: "Minute", category: "Time", example: "3ashra dqayeq (Ten minutes)" },
    { darija: "sbah", french: "Matin", english: "Morning", category: "Time", example: "F sbah (In the morning)" },
    { darija: "3shiya", french: "Soir", english: "Evening", category: "Time", example: "F 3shiya (In the evening)" },
    { darija: "lil", french: "Nuit", english: "Night", category: "Time", example: "F lil (At night)" },
    { darija: "nhar", french: "Jour", english: "Day", category: "Time", example: "Nhar kamil (Whole day)" },
    { darija: "simana", french: "Semaine", english: "Week", category: "Time", example: "Simana jaya (Next week)" },
    { darija: "shher", french: "Mois", english: "Month", category: "Time", example: "Shher madi (Last month)" },
    { darija: "3am", french: "Année", english: "Year", category: "Time", example: "3am jdid (New year)" },
    { darija: "tnayn", french: "Lundi", english: "Monday", category: "Days", example: "Nhar tnayn (On Monday)" },
    { darija: "tlat", french: "Mardi", english: "Tuesday", category: "Days", example: "Nhar tlat (On Tuesday)" },
    { darija: "larb3a", french: "Mercredi", english: "Wednesday", category: "Days", example: "Nhar larb3a (On Wednesday)" },
    { darija: "lkhmis", french: "Jeudi", english: "Thursday", category: "Days", example: "Nhar lkhmis (On Thursday)" },
    { darija: "jum3a", french: "Vendredi", english: "Friday", category: "Days", example: "Nhar jum3a (On Friday)" },
    { darija: "sebt", french: "Samedi", english: "Saturday", category: "Days", example: "Nhar sebt (On Saturday)" },
    { darija: "had", french: "Dimanche", english: "Sunday", category: "Days", example: "Nhar had (On Sunday)" },
    
    // Common Objects
    { darija: "ktab", french: "Livre", english: "Book", category: "Objects", example: "Ktab jdid (New book)" },
    { darija: "qalam", french: "Stylo", english: "Pen", category: "Objects", example: "3tini qalam (Give me a pen)" },
    { darija: "kursi", french: "Chaise", english: "Chair", category: "Objects", example: "Gles f kursi (Sit on the chair)" },
    { darija: "tabla", french: "Table", english: "Table", category: "Objects", example: "Tabla kbira (Big table)" },
    { darija: "bab", french: "Porte", english: "Door", category: "Objects", example: "Sed bab (Close the door)" },
    { darija: "sherjam", french: "Fenêtre", english: "Window", category: "Objects", example: "Hel sherjam (Open the window)" },
    { darija: "tilifizyoun", french: "Télévision", english: "Television", category: "Objects", example: "Shef tilifizyoun (Watch TV)" },
    { darija: "tilifoun", french: "Téléphone", english: "Phone", category: "Objects", example: "Tilifoun diali (My phone)" },
    { darija: "ordinatir", french: "Ordinateur", english: "Computer", category: "Objects", example: "Khdemt f ordinatir (I worked on computer)" },
    { darija: "khatem", french: "Bague", english: "Ring", category: "Objects", example: "Khatem mezyan (Nice ring)" },
    { darija: "mirat", french: "Miroir", engine: "Mirror", category: "Objects", example: "Shef f mirat (Look in the mirror)" },
    
    // Actions & Activities
    { darija: "lbsa", french: "S'habiller", english: "To dress/wear", category: "Actions", example: "Lbes qamija (Wear a shirt)" },
    { darija: "gsel", french: "Laver", english: "To wash", category: "Actions", example: "Gsel yeddik (Wash your hands)" },
    { darija: "sebegh", french: "Nager", english: "To swim", category: "Actions", example: "Kansbegh f bher (I swim in the sea)" },
    { darija: "l3eb", french: "Jouer", english: "To play", category: "Actions", example: "Drari kayl3bou (Children are playing)" },
    { darija: "jri", french: "Courir", english: "To run", category: "Actions", example: "Jri bezzaf (Run a lot)" },
    { darija: "msha binatna", french: "Marcher", english: "To walk", category: "Actions", example: "Nmshi shwiya (Walk a little)" },
    { darija: "gles", french: "S'asseoir", english: "To sit", category: "Actions", example: "Gles hna (Sit here)" },
    { darija: "wqef", french: "Se lever/Arrêter", english: "To stand/stop", category: "Actions", example: "Wqef hna (Stop here)" },
    { darija: "tsena", french: "Attendre", english: "To wait", category: "Actions", example: "Tsena shwiya (Wait a little)" },
    { darija: "siyeb", french: "Laisser", english: "To leave/let", category: "Actions", example: "Siyebni (Leave me alone)" },
    
    // Common Expressions
    { darija: "inshallah", french: "Si Dieu veut", english: "God willing", category: "Expressions", example: "Inshallah kheir (God willing, all good)" },
    { darija: "mabrouk", french: "Félicitations", english: "Congratulations", category: "Expressions", example: "Mabrouk 3lik (Congratulations to you)" },
    { darija: "bsaha", french: "À votre santé/Bon appétit", english: "Cheers/Enjoy", category: "Expressions", example: "Koul bsaha (Eat well)" },
    { darija: "allah y3awnek", french: "Que Dieu t'aide", english: "May God help you", category: "Expressions", example: "Allah y3awnek f khdma (May God help you in work)" },
    { darija: "aji", french: "Viens", english: "Come", category: "Expressions", example: "Aji hna (Come here)" },
    { darija: "sir", french: "Va", english: "Go", category: "Expressions", example: "Sir bslama (Go safely)" },
    { darija: "khassni", french: "J'ai besoin", english: "I need", category: "Expressions", example: "Khassni nkhdem (I need to work)" },
    { darija: "mazal", french: "Encore/Toujours", english: "Still/Yet", category: "Expressions", example: "Mazal ma jalsh (He hasn't come yet)" },
    { darija: "ma3lich", french: "Pas grave", english: "No problem/Never mind", category: "Expressions", example: "Ma3lich, ma3endha hetta mushkil (No problem at all)" },
    { darija: "shwiya b shwiya", french: "Petit à petit", english: "Little by little", category: "Expressions", example: "Shwiya b shwiya kanfhem (Little by little I understand)" },
    { darija: "3la hsab", french: "Ça dépend", english: "It depends", category: "Expressions", example: "3la hsab jaw (It depends on the weather)" },
    { darija: "walu", french: "Rien", english: "Nothing", category: "Expressions", example: "Ma 3endi walu (I have nothing)" },
    { darija: "kolshi", french: "Tout", english: "Everything", category: "Expressions", example: "Kolshi mezyan (Everything is good)" },
    { darija: "baraka allah fik", french: "Que Dieu te bénisse", english: "God bless you", category: "Expressions", example: "Baraka allah fik 3la lmosa3da (God bless you for the help)" },
    
    // Describing Things
    { darija: "jdid", french: "Nouveau", english: "New", category: "Descriptions", example: "Dar jdida (New house)" },
    { darija: "qdim", french: "Ancien/Vieux", english: "Old", category: "Descriptions", example: "Ktab qdim (Old book)" },
    { darija: "nqi", french: "Propre", english: "Clean", category: "Descriptions", example: "Dar nqiya (Clean house)" },
    { darija: "mweskh", french: "Sale", english: "Dirty", category: "Descriptions", example: "Serwal mweskh (Dirty pants)" },
    { darija: "mlieh", french: "Bon/Beau", english: "Good/Nice", category: "Descriptions", example: "Rajel mlieh (Good man)" },
    { darija: "khayeb", french: "Mauvais", english: "Bad", category: "Descriptions", example: "Taw khayeb (Bad weather)" },
    { darija: "sahel", french: "Facile", english: "Easy", category: "Descriptions", example: "Hadshi sahel (This is easy)" },
    { darija: "s3ib", french: "Difficile", english: "Hard/Difficult", category: "Descriptions", example: "Lkhdma s3iba (Difficult work)" },
    { darija: "tari", french: "Frais", english: "Fresh", category: "Descriptions", example: "Hout tari (Fresh fish)" },
    { darija: "qadeh", french: "Dur", english: "Hard/Tough", category: "Descriptions", example: "Khobz qadeh (Hard bread)" },
    { darija: "rqiq", french: "Mince/Doux", english: "Thin/Soft", category: "Descriptions", example: "Qmaij rqiqa (Thin fabric)" }
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

  const categories = Object.keys(groupedEntries).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToTranslator')}
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

        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-primary border-b border-border pb-2">
                {category}
              </h2>
              <div className="grid gap-4">
                {groupedEntries[category].map((entry, index) => (
                  <Card key={`${category}-${index}`} className="hover:shadow-elegant transition-all duration-300 border-l-4 border-l-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-2xl font-bold text-primary">{entry.darija}</span>
                            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                              {entry.category}
                            </span>
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
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{t('dictionary.noResults')}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dictionary;
