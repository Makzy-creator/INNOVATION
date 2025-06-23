import React from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  LightBulbIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import BloodDropletLogo from '../components/BloodDropletLogo'

const About: React.FC = () => {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Security',
      description: 'Every donation is immutably recorded on the Internet Computer blockchain, ensuring complete transparency and preventing fraud.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Network',
      description: 'Connect with donors and recipients worldwide, breaking down geographical barriers to save more lives.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Built by the community, for the community. Every feature is designed with user feedback and real-world needs in mind.'
    },
    {
      icon: LightBulbIcon,
      title: 'Smart Matching',
      description: 'AI-powered algorithms match donors with recipients based on blood type, location, urgency, and availability.'
    }
  ]

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      bio: 'Former head of hematology at Johns Hopkins with 15 years of experience in blood banking.',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Blockchain Lead',
      bio: 'Former senior engineer at Dfinity Foundation, expert in Internet Computer development.',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Dr. Amara Okafor',
      role: 'Head of Operations',
      bio: 'Public health specialist with extensive experience in healthcare systems across Africa.',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'James Rodriguez',
      role: 'Product Manager',
      bio: 'Former product lead at major healthcare platforms, passionate about user-centered design.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    }
  ]

  const stats = [
    { number: '50,000+', label: 'Lives Saved' },
    { number: '100,000+', label: 'Registered Users' },
    { number: '1,000+', label: 'Partner Hospitals' },
    { number: '25+', label: 'Countries' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <BloodDropletLogo size="xl" animated />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                About <span className="text-gradient">LIFEFLOW</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              Your one pint of blood can save 5 Lives. We're revolutionizing blood donation through blockchain technology, 
              creating a transparent, secure, and efficient platform that saves lives globally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Every 2 seconds, someone in the world needs blood. Yet, millions of people die 
                annually due to lack of access to safe blood transfusions. We believe technology 
                can bridge this gap.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                LIFEFLOW leverages the power of blockchain technology to create a transparent, 
                secure, and efficient blood donation ecosystem. Our platform connects donors with 
                recipients instantly, ensures the integrity of donation records, and builds trust 
                in the blood donation process.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <BloodDropletLogo size="md" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Saving Lives Through Innovation</h3>
                  <p className="text-gray-600">One donation at a time</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Blood donation"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-primary-600 opacity-10 rounded-lg"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Numbers that matter</p>
          </motion.div>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose LIFEFLOW?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with humanitarian purpose to create 
              the most advanced blood donation platform in the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <feature.icon className="h-8 w-8 text-primary-600" />
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

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A diverse group of experts united by the mission to save lives through technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Blockchain technology"
                className="rounded-lg shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <AcademicCapIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Powered by Internet Computer
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                We've chosen the Internet Computer blockchain for its unique capabilities: 
                infinite scalability, web-speed performance, and sustainable energy consumption.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Immutable Records</h4>
                    <p className="text-gray-600">Every donation is permanently recorded and cannot be altered</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Processing</h4>
                    <p className="text-gray-600">Instant matching and verification of donors and recipients</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Global Accessibility</h4>
                    <p className="text-gray-600">Accessible from anywhere in the world with internet connection</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
                Join the Revolution
              </h2>
            </div>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Be part of the future of blood donation. Together, we can save more lives 
              and create a world where no one dies from lack of blood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started Today
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About