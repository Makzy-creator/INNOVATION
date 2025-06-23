import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  CheckCircleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import ConversationalAI from '../components/ConversationalAI'
import TavusVideoButton from '../components/TavusVideoButton'
import BloodDropletLogo from '../components/BloodDropletLogo'

const Home: React.FC = () => {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Security',
      description: 'Every donation is immutably recorded on the Internet Computer blockchain for complete transparency.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Network',
      description: 'Connect with donors and recipients worldwide, breaking down geographical barriers.'
    },
    {
      icon: UserGroupIcon,
      title: 'Smart Matching',
      description: 'AI-powered algorithms match donors with recipients based on compatibility and urgency.'
    },
    {
      icon: BloodDropletLogo,
      title: 'Life-Saving Impact',
      description: 'Track your donation impact and see how many lives you\'ve helped save.'
    }
  ]

  const stats = [
    { number: '50,000+', label: 'Lives Saved' },
    { number: '100,000+', label: 'Registered Users' },
    { number: '1,000+', label: 'Partner Hospitals' },
    { number: '25+', label: 'Countries' }
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Emergency Medicine Physician',
      content: 'LIFEFLOW has revolutionized how we handle blood requests. The blockchain transparency gives us complete confidence in the donation process.',
      avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'Regular Blood Donor',
      content: 'The AI assistant helped me understand the entire donation process. I love seeing the real impact of my donations on the blockchain.',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Dr. Amara Okafor',
      role: 'Hematologist',
      content: 'The premium features have streamlined our hospital\'s blood management. The API integration was seamless and the analytics are invaluable.',
      avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Main Catchphrase with Animation */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-gradient">Your one pint of blood can save </span>
                <span className="animated-text text-gradient">5 Lives</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                The world's first blockchain-powered blood donation platform with AI assistance. 
                Connect donors with recipients instantly and transparently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Start Saving Lives
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <TavusVideoButton 
                  buttonText="Meet Dr. Vita"
                  className="text-lg px-8 py-4"
                />
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Free to join
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Blockchain verified
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  AI-powered matching
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Blood donation"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-primary-600 opacity-10 rounded-lg"></div>
              
              {/* Floating Video Agent Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 max-w-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <VideoCameraIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Dr. Vita - AI Specialist</p>
                    <p className="text-xs text-gray-600">Interactive video learning</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of blood donation with cutting-edge technology 
              and AI-powered assistance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    {feature.icon === BloodDropletLogo ? (
                      <BloodDropletLogo size="md" />
                    ) : (
                      <feature.icon className="h-8 w-8 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dr. Vita Video Agent Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Dr. Vita - Your AI Video Specialist
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Experience the future of interactive learning with our real-time AI video agent. 
                Dr. Vita provides personalized guidance through immersive video conversations, 
                making blood donation education engaging and memorable.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Real-time video conversations with AI</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Interactive mystery cases and assessments</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Personalized learning paths and storytelling</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Voice interaction and emotional intelligence</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <TavusVideoButton 
                  triggerHook="life-saving-detective"
                  buttonText="Try Mystery Case"
                  className="justify-center"
                />
                <TavusVideoButton 
                  triggerHook="donation-impact-calculator"
                  buttonText="Take Assessment"
                  className="justify-center bg-secondary-600 hover:bg-secondary-700"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <VideoCameraIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Dr. Vita</h4>
                    <p className="text-sm text-gray-600">AI Blood Donation Specialist</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Video Preview */}
                <div className="bg-gray-900 rounded-lg h-48 flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <BloodDropletLogo size="md" />
                    </div>
                    <p className="text-sm">Interactive Video Learning</p>
                  </div>
                </div>

                {/* Sample Conversation */}
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-900">
                      "Hello! I'm Dr. Vita. I can help you solve medical mysteries, 
                      assess your donation potential, and guide you through our platform. 
                      What would you like to explore today?"
                    </p>
                  </div>
                  <div className="bg-primary-600 text-white p-3 rounded-lg ml-8">
                    <p className="text-sm">I want to learn about blood donation safety</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-900">
                      "Perfect! Let me share a real case that shows how safe our process is..."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Tutorials Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Learn with Interactive Video Tutorials
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master blood donation and our platform with comprehensive video guides. 
              From beginner basics to advanced blockchain features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: 'Getting Started',
                description: 'Learn the basics of blood donation and platform setup',
                duration: '5:30',
                level: 'Beginner',
                thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                title: 'Blockchain Basics',
                description: 'Understand how blockchain secures your donations',
                duration: '10:15',
                level: 'Intermediate',
                thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                title: 'Advanced Analytics',
                description: 'Track your impact with detailed analytics',
                duration: '12:45',
                level: 'Advanced',
                thumbnail: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400'
              }
            ].map((tutorial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img src={tutorial.thumbnail} alt={tutorial.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {tutorial.duration}
                  </div>
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-2 py-1 rounded text-xs">
                    {tutorial.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600">{tutorial.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/tutorials" className="btn-primary">
              View All Tutorials
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Features Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Unlock Premium Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take your blood donation experience to the next level with advanced AI, 
              enhanced security, and professional tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: 'Basic Plus',
                price: '$9.99',
                features: ['Priority notifications', 'Advanced tracking', 'Health insights'],
                color: 'border-blue-200'
              },
              {
                name: 'Pro Donor',
                price: '$19.99',
                features: ['AI-powered matching', 'Emergency alerts', 'Blockchain verification'],
                color: 'border-primary-200',
                popular: true
              },
              {
                name: 'Healthcare Pro',
                price: '$49.99',
                features: ['Multi-facility management', 'API access', 'Custom reporting'],
                color: 'border-purple-200'
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`card p-6 relative ${plan.color}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                  <div className="text-gray-600">/month</div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full btn-outline">
                  Start Free Trial
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/premium" className="btn-primary">
              View All Premium Features
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what doctors, donors, and healthcare organizations say about LIFEFLOW
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <BloodDropletLogo size="lg" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Save Lives?
              </h2>
            </div>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of donors and recipients using LIFEFLOW to make blood donation 
              more transparent, secure, and efficient than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105">
                Get Started Free
              </Link>
              <TavusVideoButton 
                buttonText="Talk to Dr. Vita"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conversational AI Component */}
      <ConversationalAI />
    </div>
  )
}

export default Home