
import React from 'react'
import { Button } from './ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { Globe } from 'lucide-react'

const LanguageSwitch: React.FC = () => {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 text-gray-300 hover:text-white"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{language.toUpperCase()}</span>
    </Button>
  )
}

export default LanguageSwitch
