'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { Mic, Play, Pause, Save, Share, ThumbsUp, MessageSquare, Download, Trash2, User, Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"

export default function LyricRecordingApp() {
  const [activeTab, setActiveTab] = useState('record')
  const [isRecording, setIsRecording] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [isMetronomeActive, setIsMetronomeActive] = useState(false)
  const [recordings, setRecordings] = useState([
    { id: 1, createdAt: new Date().toISOString(), likes: 5, comments: [] },
    { id: 2, createdAt: new Date().toISOString(), likes: 3, comments: [] }
  ])
  const [profile, setProfile] = useState({
    name: 'John Doe',
    bio: 'Aspiring musician and songwriter',
    avatar: '/placeholder.svg'
  })
  const [colors, setColors] = useState({
    primary: '#6D28D9',
    secondary: '#2563EB',
    accent: '#F59E0B',
    text: '#FFFFFF',
    background: '#1F2937'
  })
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(0)

  const pendulumControls = useAnimation()
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const dataArray = useRef<Uint8Array | null>(null)
  const source = useRef<MediaStreamAudioSourceNode | null>(null)
  const rafId = useRef<number | null>(null)
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0))

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isMetronomeActive) {
      pendulumControls.start({
        rotate: [45, -45],
        transition: {
          duration: 60 / tempo,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      })
    } else {
      pendulumControls.stop()
    }
  }, [isMetronomeActive, tempo, pendulumControls])

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioContext.current = new AudioContext()
        analyser.current = audioContext.current.createAnalyser()
        source.current = audioContext.current.createMediaStreamSource(stream)
        source.current.connect(analyser.current)
        analyser.current.fftSize = 64
        dataArray.current = new Uint8Array(analyser.current.frequencyBinCount)
        rafId.current = requestAnimationFrame(updateAudioData)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        return
      }
    } else {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      if (source.current) source.current.disconnect()
      if (audioContext.current) audioContext.current.close()
    }
    setIsRecording(!isRecording)
  }

  const updateAudioData = () => {
    if (analyser.current && dataArray.current) {
      analyser.current.getByteFrequencyData(dataArray.current)
      setAudioData(Array.from(dataArray.current).slice(0, 32))
      rafId.current = requestAnimationFrame(updateAudioData)
    }
  }

  const toggleMetronome = () => setIsMetronomeActive(!isMetronomeActive)

  const handleSaveRecording = () => {
    const newRecording = {
      id: recordings.length + 1,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    }
    setRecordings([...recordings, newRecording])
  }

  const handleDeleteRecording = (id) => {
    setRecordings(recordings.filter(rec => rec.id !== id))
  }

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleColorChange = (e) => {
    setColors({ ...colors, [e.target.name]: e.target.value })
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    setColors(prevColors => ({
      ...prevColors,
      text: isDarkMode ? '#000000' : '#FFFFFF',
      background: isDarkMode ? '#FFFFFF' : '#1F2937'
    }))
  }

  const nextOnboardingStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      setShowOnboarding(false)
    }
  }

  const onboardingSteps = [
    { title: "Welcome!", content: "Let's get you started with Lyric Recording Studio." },
    { title: "Record", content: "Use the Record tab to create new recordings." },
    { title: "My Recordings", content: "Manage your saved recordings in the My Recordings tab." },
    { title: "Customize", content: "Personalize your experience in the Config tab." }
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Lyric Recording Studio
        </motion.div>
        <Progress value={66} className="w-64" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 ${isDarkMode ? 'dark' : ''}`} style={{ background: colors.background, color: colors.text }}>
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md" style={{ color: colors.text, background: colors.background }}>
              <h2 className="text-2xl font-bold mb-4">{onboardingSteps[onboardingStep].title}</h2>
              <p className="mb-4">{onboardingSteps[onboardingStep].content}</p>
              <Button onClick={nextOnboardingStep} style={{ background: colors.primary, color: colors.text }}>
                {onboardingStep < 3 ? 'Next' : 'Get Started'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: colors.text }}>Lyric Recording Studio</h1>
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" style={{ color: colors.text }} />
          <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
          <Moon className="h-4 w-4" style={{ color: colors.text }} />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-6" style={{ background: colors.secondary }}>
          <TabsTrigger value="record" className="text-lg sm:text-xl" style={{ color: colors.text }}>Record</TabsTrigger>
          <TabsTrigger value="myRecordings" className="text-lg sm:text-xl" style={{ color: colors.text }}>My Recordings</TabsTrigger>
          <TabsTrigger value="config" className="text-lg sm:text-xl" style={{ color: colors.text }}>Config</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record">
          <Card style={{ background: colors.background, color: colors.text }}>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Recording Studio</CardTitle>
              <CardDescription style={{ color: colors.text }}>Set your tempo and start recording!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Tempo Setup</h3>
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Slider
                      value={[tempo]}
                      onValueChange={(value) => setTempo(value[0])}
                      min={60}
                      max={200}
                      step={1}
                      className="w-full sm:w-64"
                    />
                    <span className="text-lg">{tempo} BPM</span>
                    <Button onClick={toggleMetronome} variant={isMetronomeActive ? "secondary" : "outline"} className="w-full sm:w-auto" style={{ background: isMetronomeActive ? colors.secondary : 'transparent', color: colors.text, borderColor: colors.text }}>
                      {isMetronomeActive ? 'Stop' : 'Start'} Metronome
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <motion.div
                    animate={pendulumControls}
                    style={{
                      width: '4px',
                      height: '100px',
                      backgroundColor: colors.accent,
                      originY: 0,
                    }}
                  />
                </div>
                
                <div className="h-32 sm:h-40 md:h-48 flex items-end justify-center space-x-1">
                  {audioData.map((value, index) => (
                    <motion.div
                      key={index}
                      className="w-2 sm:w-3 md:w-4"
                      style={{ background: `linear-gradient(to top, ${colors.secondary}, ${colors.accent})` }}
                      initial={{ height: 0 }}
                      animate={{ height: isRecording ? `${value / 2}%` : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <Button onClick={toggleRecording} className="w-full sm:w-auto" style={{ background: colors.primary, color: colors.text }}>
                    {isRecording ? <Pause className="mr-2" /> : <Mic className="mr-2" />}
                    {isRecording ? 'Stop' : 'Start'} Recording
                  </Button>
                  <Button onClick={handleSaveRecording} disabled={isRecording} className="w-full sm:w-auto" style={{ background: colors.secondary, color: colors.text }}>
                    <Save className="mr-2" /> Save Recording
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="myRecordings">
          <Card style={{ background: colors.background, color: colors.text }}>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">My Recordings</CardTitle>
              <CardDescription style={{ color: colors.text }}>Manage and share your recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div key={recording.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg" style={{ borderColor: colors.text }}>
                    <div className="mb-4 sm:mb-0">
                      <p className="font-semibold text-lg">Recording {recording.id}</p>
                      <p className="text-sm opacity-70">{new Date(recording.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" style={{ background: colors.primary, color: colors.text }}>
                        <Download className="mr-2 h-4 w-4" /> Export
                      </Button>
                      <Button variant="outline" style={{ background: colors.secondary, color: colors.text }}>
                        <Share className="mr-2 h-4 w-4" /> Share
                      </Button>
                      <Button variant="outline" style={{ background: colors.accent, color: colors.text }}>
                        <ThumbsUp className="mr-2 h-4 w-4" /> {recording.likes}
                      </Button>
                      <Button variant="outline" style={{ background: colors.primary, color: colors.text }}>
                        <MessageSquare className="mr-2 h-4 w-4" /> {recording.comments.length}
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteRecording(recording.id)} style={{ background: 'red', color: colors.text }}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card style={{ background: colors.background, color: colors.text }}>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Configuration</CardTitle>
              <CardDescription style={{ color: colors.text }}>Customize your profile and app appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">User Profile</h3>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label htmlFor="name" style={{ color: colors.text }}>Name</Label>
                      <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} style={{ background: colors.background, color: colors.text, borderColor: colors.text }} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio" style={{ color: colors.text }}>Bio</Label>
                    <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} style={{ background: colors.background, color: colors.text, borderColor: colors.text }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Color Customization</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(colors).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={key} style={{ color: colors.text }}>{key.charAt(0).toUpperCase() + key.slice(1)} Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input type="color" id={key} name={key} value={value} onChange={handleColorChange} className="w-10 h-10 p-1" style={{ background: colors.background, borderColor: colors.text }} />
                          <span>{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Theme</h3>
                  <div className="flex items-center space-x-2">
                    <Switch id="theme-toggle" checked={isDarkMode} onCheckedChange={toggleTheme} />
                    <Label htmlFor="theme-toggle" style={{ color: colors.text }}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}