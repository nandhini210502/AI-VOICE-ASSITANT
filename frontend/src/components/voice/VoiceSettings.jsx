import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, Gauge, Music } from 'lucide-react'
import { useVoiceStore } from '../../stores/voiceStore'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

const languageOptions = [
  { label: 'Auto Detect', value: '' },
  { label: 'English', value: 'en-US' },
  { label: 'Tamil', value: 'ta-IN' },
  { label: 'Hindi', value: 'hi-IN' },
  { label: 'Telugu', value: 'te-IN' },
  { label: 'Malayalam', value: 'ml-IN' },
  { label: 'Kannada', value: 'kn-IN' },
  { label: 'Bengali', value: 'bn-IN' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'Italian', value: 'it-IT' },
  { label: 'Portuguese', value: 'pt-BR' },
  { label: 'Russian', value: 'ru-RU' },
  { label: 'Japanese', value: 'ja-JP' },
  { label: 'Korean', value: 'ko-KR' },
  { label: 'Chinese', value: 'zh-CN' },
  { label: 'Arabic', value: 'ar-SA' },
  { label: 'Turkish', value: 'tr-TR' },
  { label: 'Dutch', value: 'nl-NL' },
  { label: 'Polish', value: 'pl-PL' },
  { label: 'Swedish', value: 'sv-SE' },
  { label: 'Norwegian', value: 'nb-NO' },
  { label: 'Danish', value: 'da-DK' },
  { label: 'Finnish', value: 'fi-FI' },
  { label: 'Greek', value: 'el-GR' },
  { label: 'Hebrew', value: 'he-IL' },
  { label: 'Thai', value: 'th-TH' },
  { label: 'Vietnamese', value: 'vi-VN' },
  { label: 'Indonesian', value: 'id-ID' },
  { label: 'Malay', value: 'ms-MY' },
  { label: 'Ukrainian', value: 'uk-UA' }
];

export default function VoiceSettings({ open, onClose }) {
  const { voiceSettings, setVoiceSettings } = useVoiceStore()
  const { getAvailableVoices } = useTextToSpeech()
  const [voices, setVoices] = useState([])

  useEffect(() => {
    if (open) {
      const loadVoices = () => {
        const available = getAvailableVoices()
        setVoices(available)
        
        // Set default voice to Zira or first female if none selected
        if (!useVoiceStore.getState().voiceSettings.voiceURI && available.length > 0) {
          const zira = available.find(v => v.name.includes('Zira'))
          const firstFemale = available.find(v => ['Jenny', 'Aria', 'Natasha', 'Clara', 'Freya', 'Joanne', 'Kim', 'Tina', 'Elsie', 'Carly', 'Annette', 'Evelyn', 'Monica', 'Nancy', 'Serena', 'Elizabeth', 'Cora', 'Michelle', 'Lola', 'Ava', 'Emma', 'Jane', 'Sonia', 'Libby', 'Mia', 'Leah'].some(n => v.name.includes(n)))
          const defaultVoice = zira || firstFemale || available[0]
          if (defaultVoice) {
            setVoiceSettings({ voiceURI: defaultVoice.voiceURI })
          }
        }
      }
      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices

      return () => {
        speechSynthesis.onvoiceschanged = null
      }
    }
  }, [open, getAvailableVoices, setVoiceSettings])

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    const filtered = newLang 
      ? voices.filter(v => v.lang.startsWith(newLang.split('-')[0]))
      : voices;
      
    const female = filtered.filter(v => 
      ['Zira', 'Jenny', 'Aria', 'Natasha', 'Clara', 'Freya', 'Joanne', 'Kim', 'Tina', 'Elsie', 'Carly', 'Annette', 'Evelyn', 'Monica', 'Nancy', 'Serena', 'Elizabeth', 'Cora', 'Michelle', 'Lola', 'Ava', 'Emma', 'Jane', 'Sonia', 'Libby', 'Mia', 'Leah'].some(n => v.name.includes(n))
    );
    const defaultVoice = female.find(v => v.name.includes('Zira')) || female[0] || filtered[0];
    
    setVoiceSettings({ 
      preferredLang: newLang, 
      voiceURI: defaultVoice ? defaultVoice.voiceURI : '' 
    });
  };

  const cleanVoiceName = (name) => {
    return name
      .replace('Microsoft ', '')
      .replace(' Online (Natural)', '')
      .replace(' Multilingual', ' 🌍')
      .replace(' - English (United States)', ' 🇺🇸')
      .replace(' - English (United Kingdom)', ' 🇬🇧')
      .replace(' - English (Australia)', ' 🇦🇺')
      .replace(' - English (Canada)', ' 🇨🇦')
      .replace(' - English (India)', ' 🇮🇳')
      .replace(/ - .*$/, '')
  }

  const selectedLang = voiceSettings.preferredLang || ''

  const filteredVoices = selectedLang 
    ? voices.filter(v => v.lang.startsWith(selectedLang.split('-')[0]))
    : voices

  const femaleVoices = filteredVoices.filter(v => 
    ['Zira', 'Jenny', 'Aria', 'Natasha', 'Clara', 'Freya', 
     'Joanne', 'Kim', 'Tina', 'Elsie', 'Carly', 'Annette',
     'Evelyn', 'Monica', 'Nancy', 'Serena', 'Elizabeth',
     'Cora', 'Michelle', 'Lola', 'Ava', 'Emma', 'Jane',
     'Sonia', 'Libby', 'Mia', 'Leah'].some(n => v.name.includes(n))
  )

  const maleVoices = filteredVoices.filter(v => 
    ['David', 'Mark', 'William', 'Neil', 'Ken', 'Tim',
     'Darren', 'Duncan', 'Ryan', 'Roger', 'Eric', 'Jacob',
     'Lewis', 'Samuel', 'Steffan', 'Derek', 'Davis',
     'Dustin', 'Brian', 'Andrew', 'Guy', 'Liam'].some(n => v.name.includes(n))
  )

  const Slider = ({ label, icon: Icon, field, min, max, step }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm" style={{ color: '#ffffff' }}>
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <span className="text-accent text-sm font-mono">{voiceSettings[field].toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={voiceSettings[field]}
        onChange={(e) => setVoiceSettings({ [field]: parseFloat(e.target.value) })}
        className="w-full accent-accent"
      />
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 w-80 rounded-2xl p-5 z-50"
            style={{ backgroundColor: '#0f0f1a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold" style={{ color: '#e2e8f0' }}>Voice Settings</h3>
              <button onClick={onClose} className="p-1.5 hover:bg-white/8 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="space-y-5">
              <Slider label="Speed" icon={Gauge} field="rate" min={0.5} max={2.0} step={0.1} />
              <Slider label="Volume" icon={Volume2} field="volume" min={0} max={1} step={0.1} />
              <Slider label="Pitch" icon={Music} field="pitch" min={0.5} max={2.0} step={0.1} />

              <div>
                <label className="text-sm block mb-2" style={{ color: '#ffffff' }}>Speech Language</label>
                <select
                  value={voiceSettings.preferredLang}
                  onChange={handleLangChange}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:border-accent/40 transition-colors"
                  style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.label} value={opt.value} style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0' }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {filteredVoices.length > 0 && (
                <div>
                  <label className="text-sm block mb-2" style={{ color: '#ffffff' }}>Voice</label>
                  <select
                    value={voiceSettings.voiceURI}
                    onChange={(e) => setVoiceSettings({ voiceURI: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:border-accent/40 transition-colors"
                    style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <option value="" style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0' }}>Auto-select</option>
                    <optgroup label="👩 Female Voices" style={{ backgroundColor: '#1a1a2e', color: '#c084fc' }}>
                      {femaleVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI} style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0' }}>
                          {cleanVoiceName(v.name)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="👨 Male Voices" style={{ backgroundColor: '#1a1a2e', color: '#c084fc' }}>
                      {maleVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI} style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0' }}>
                          {cleanVoiceName(v.name)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
