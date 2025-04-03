"use client"

import { createContext, useContext, useState } from "react"

type Language = "en" | "hi"

interface Translations {
  [key: string]: {
    en: string
    hi: string
  }
}

const translations: Translations = {
  welcome: {
    en: "Welcome to Kuber",
    hi: "कुबेर में आपका स्वागत है"
  },
  subtitle: {
    en: "The ultimate jewelry business management solution for modern jewelers",
    hi: "आधुनिक ज्वैलर्स के लिए संपूर्ण ज्वैलरी बिजनेस मैनेजमेंट सॉल्यूशन"
  },
  getStarted: {
    en: "Get Started",
    hi: "शुरू करें"
  },
  learnMore: {
    en: "Learn More",
    hi: "और जानें"
  },
  activeUsers: {
    en: "Active Users",
    hi: "सक्रिय उपयोगकर्ता"
  },
  transactionsProcessed: {
    en: "Transactions Processed",
    hi: "लेन-देन प्रोसेस किए गए"
  },
  customerSatisfaction: {
    en: "Customer Satisfaction",
    hi: "ग्राहक संतुष्टि"
  },
  featuresTitle: {
    en: "Everything You Need to Manage Your Jewelry Business",
    hi: "आपके ज्वैलरी बिजनेस को मैनेज करने के लिए सब कुछ"
  },
  stockManagement: {
    en: "Stock Management",
    hi: "स्टॉक मैनेजमेंट"
  },
  stockDesc: {
    en: "Track your jewelry inventory with precision and ease",
    hi: "अपने ज्वैलरी इन्वेंटरी को सटीकता और आसानी से ट्रैक करें"
  },
  invoicing: {
    en: "Invoicing",
    hi: "बिल बनाना"
  },
  invoicingDesc: {
    en: "Create professional invoices and manage transactions",
    hi: "प्रोफेशनल बिल बनाएं और लेन-देन का प्रबंधन करें"
  },
  customerRelations: {
    en: "Customer Relations",
    hi: "ग्राहक संबंध"
  },
  customerDesc: {
    en: "Build lasting relationships with your valued customers",
    hi: "अपने मूल्यवान ग्राहकों के साथ स्थायी संबंध बनाएं"
  },
  reminders: {
    en: "Reminders",
    hi: "रिमाइंडर"
  },
  remindersDesc: {
    en: "Never miss important dates and payment schedules",
    hi: "महत्वपूर्ण तिथियां और भुगतान शेड्यूल कभी न भूलें"
  },
  analytics: {
    en: "Analytics",
    hi: "एनालिटिक्स"
  },
  analyticsDesc: {
    en: "Gain insights into your business performance",
    hi: "अपने व्यवसाय के प्रदर्शन की जानकारी प्राप्त करें"
  },
  oldStock: {
    en: "Old Stock",
    hi: "पुराना स्टॉक"
  },
  oldStockDesc: {
    en: "Efficiently manage purchased and exchanged items",
    hi: "खरीदे और एक्सचेंज किए गए आइटम्स का कुशलतापूर्वक प्रबंधन करें"
  },
  ready: {
    en: "Ready to Transform Your Jewelry Business?",
    hi: "अपना ज्वैलरी बिजनेस बदलने के लिए तैयार हैं?"
  },
  joinText: {
    en: "Join thousands of successful jewelers who trust Kuber for their business management needs",
    hi: "हजारों सफल ज्वैलर्स से जुड़ें जो अपने व्यवसाय प्रबंधन के लिए कुबेर पर भरोसा करते हैं"
  },
  startJourney: {
    en: "Start Your Journey",
    hi: "अपनी यात्रा शुरू करें"
  },
  login: {
    en: "Login",
    hi: "लॉगिन"
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext) 