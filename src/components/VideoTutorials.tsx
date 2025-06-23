import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  PauseIcon, 
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  videoUrl: string
  thumbnail: string
  completed?: boolean
  skills: string[]
}

interface LearningPath {
  id: string
  name: string
  description: string
  tutorials: string[]
  estimatedTime: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

const VideoTutorials: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])

  const tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Innovation',
      description: 'Learn the basics of our blood donation platform and how to create your account',
      duration: '5:30',
      difficulty: 'Beginner',
      category: 'Getting Started',
      videoUrl: 'https://example.com/video1',
      thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Account Setup', 'Profile Creation', 'Basic Navigation']
    },
    {
      id: 'blood-donation-basics',
      title: 'Blood Donation Fundamentals',
      description: 'Understanding blood types, donation process, and safety requirements',
      duration: '8:45',
      difficulty: 'Beginner',
      category: 'Blood Donation',
      videoUrl: 'https://example.com/video2',
      thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Blood Types', 'Safety Guidelines', 'Eligibility Requirements']
    },
    {
      id: 'finding-requests',
      title: 'Finding and Responding to Blood Requests',
      description: 'How to browse, filter, and respond to blood donation requests in your area',
      duration: '6:20',
      difficulty: 'Beginner',
      category: 'Platform Usage',
      videoUrl: 'https://example.com/video3',
      thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Request Filtering', 'Location Matching', 'Response Process']
    },
    {
      id: 'blockchain-basics',
      title: 'Understanding Blockchain in Blood Donation',
      description: 'Learn how blockchain technology ensures transparency and security',
      duration: '10:15',
      difficulty: 'Intermediate',
      category: 'Blockchain',
      videoUrl: 'https://example.com/video4',
      thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Blockchain Basics', 'Transaction Verification', 'Data Security']
    },
    {
      id: 'wallet-connection',
      title: 'Connecting Your Digital Wallet',
      description: 'Step-by-step guide to connecting and managing your blockchain wallet',
      duration: '7:30',
      difficulty: 'Intermediate',
      category: 'Blockchain',
      videoUrl: 'https://example.com/video5',
      thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Wallet Setup', 'Security Best Practices', 'Transaction Management']
    },
    {
      id: 'emergency-requests',
      title: 'Handling Emergency Blood Requests',
      description: 'How to create and respond to critical blood donation requests',
      duration: '9:10',
      difficulty: 'Intermediate',
      category: 'Advanced Features',
      videoUrl: 'https://example.com/video6',
      thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Emergency Protocols', 'Priority Alerts', 'Rapid Response']
    },
    {
      id: 'analytics-dashboard',
      title: 'Using the Analytics Dashboard',
      description: 'Advanced analytics and insights for tracking your donation impact',
      duration: '12:45',
      difficulty: 'Advanced',
      category: 'Advanced Features',
      videoUrl: 'https://example.com/video7',
      thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Data Analysis', 'Impact Tracking', 'Report Generation']
    },
    {
      id: 'api-integration',
      title: 'API Integration for Healthcare Organizations',
      description: 'Technical guide for integrating our platform with existing healthcare systems',
      duration: '15:20',
      difficulty: 'Advanced',
      category: 'Developer',
      videoUrl: 'https://example.com/video8',
      thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['API Usage', 'System Integration', 'Technical Implementation']
    }
  ]

  const learningPaths: LearningPath[] = [
    {
      id: 'new-donor',
      name: 'New Donor Journey',
      description: 'Complete guide for first-time blood donors',
      tutorials: ['getting-started', 'blood-donation-basics', 'finding-requests'],
      estimatedTime: '20 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'blockchain-mastery',
      name: 'Blockchain Mastery',
      description: 'Master blockchain features and digital wallet management',
      tutorials: ['blockchain-basics', 'wallet-connection'],
      estimatedTime: '18 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'advanced-user',
      name: 'Advanced User Features',
      description: 'Unlock the full potential of our platform',
      tutorials: ['emergency-requests', 'analytics-dashboard'],
      estimatedTime: '22 minutes',
      difficulty: 'Advanced'
    },
    {
      id: 'healthcare-professional',
      name: 'Healthcare Professional',
      description: 'Technical integration and advanced management features',
      tutorials: ['api-integration', 'analytics-dashboard', 'emergency-requests'],
      estimatedTime: '37 minutes',
      difficulty: 'Advanced'
    }
  ]

  const categories = ['all', 'Getting Started', 'Blood Donation', 'Platform Usage', 'Blockchain', 'Advanced Features', 'Developer']

  const filteredTutorials = selectedCategory === 'all' 
    ? tutorials 
    : tutorials.filter(tutorial => tutorial.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const markAsCompleted = (tutorialId: string) => {
    setCompletedTutorials(prev => 
      prev.includes(tutorialId) ? prev : [...prev, tutorialId]
    )
  }

  const getPathProgress = (path: LearningPath) => {
    const completed = path.tutorials.filter(id => completedTutorials.includes(id)).length
    return Math.round((completed / path.tutorials.length) * 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Video Tutorials
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn everything about blood donation and our platform through comprehensive video guides. 
          From basic concepts to advanced features, we've got you covered.
        </p>
      </motion.div>

      {/* Learning Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Learning Paths</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningPaths.map((path, index) => (
            <div key={path.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <AcademicCapIcon className="h-8 w-8 text-primary-600" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(path.difficulty)}`}>
                  {path.difficulty}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{path.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{path.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {path.estimatedTime}
                </span>
                <span>{path.tutorials.length} videos</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{getPathProgress(path)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPathProgress(path)}%` }}
                  ></div>
                </div>
              </div>
              <button className="w-full btn-primary text-sm">
                {getPathProgress(path) > 0 ? 'Continue Learning' : 'Start Path'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial, index) => (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            className="card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedTutorial(tutorial)}
          >
            <div className="relative">
              <img
                src={tutorial.thumbnail}
                alt={tutorial.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PlayIcon className="h-12 w-12 text-white" />
              </div>
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {tutorial.duration}
              </div>
              {completedTutorials.includes(tutorial.id) && (
                <div className="absolute top-4 left-4 bg-green-500 text-white p-1 rounded-full">
                  <CheckCircleIcon className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </span>
                <span className="text-xs text-gray-500">{tutorial.category}</span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
              
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Skills you'll learn:</p>
                <div className="flex flex-wrap gap-1">
                  {tutorial.skills.slice(0, 2).map((skill, skillIndex) => (
                    <span key={skillIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {tutorial.skills.length > 2 && (
                    <span className="text-xs text-gray-500">+{tutorial.skills.length - 2} more</span>
                  )}
                </div>
              </div>
              
              <button className="w-full btn-outline text-sm">
                {completedTutorials.includes(tutorial.id) ? 'Watch Again' : 'Watch Now'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="relative">
              <div className="bg-gray-900 h-64 md:h-96 flex items-center justify-center">
                <div className="text-center text-white">
                  <PlayIcon className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Video Player</p>
                  <p className="text-sm opacity-75">Duration: {selectedTutorial.duration}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTutorial(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedTutorial.title}</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(selectedTutorial.difficulty)}`}>
                  {selectedTutorial.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedTutorial.description}</p>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Skills you'll learn:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTutorial.skills.map((skill, index) => (
                    <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => markAsCompleted(selectedTutorial.id)}
                  className="btn-primary"
                  disabled={completedTutorials.includes(selectedTutorial.id)}
                >
                  {completedTutorials.includes(selectedTutorial.id) ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Mark as Completed'
                  )}
                </button>
                <button className="btn-outline">
                  Add to Learning Path
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default VideoTutorials