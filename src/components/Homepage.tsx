import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Database, Zap, Check, Server, Shield, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">ServiceScale AI</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transform HVAC & Home Services Quotes with AI Intelligence
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Enterprise-grade quote automation platform that turns property data into personalized, high-converting proposals
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 font-semibold flex items-center justify-center"
              >
                Schedule Enterprise Demo <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-blue-800/20 font-semibold">
                View Success Stories
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logo Banner */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 mb-8 text-lg">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {['Semper Fi HVAC', 'Legacy Air', 'Cool Breeze Systems', 'Comfort Zone Inc.'].map((name) => (
              <div key={name} className="text-xl font-semibold text-gray-400 bg-white px-6 py-3 rounded-lg shadow-sm">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Enterprise-Grade Quote Automation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="h-8 w-8 text-blue-600" />,
                title: 'Seamless CRM Integration',
                description: 'Direct integration with ServiceTitan, House Call Pro, and other leading platforms'
              },
              {
                icon: <Brain className="h-8 w-8 text-blue-600" />,
                title: 'AI-Powered Intelligence',
                description: 'Analyze property data and permits to identify high-value opportunities automatically'
              },
              {
                icon: <Zap className="h-8 w-8 text-blue-600" />,
                title: 'Instant Quote Generation',
                description: 'Create personalized, professional quotes in seconds using your existing pricebook'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10x', label: 'Revenue Increase', subtext: 'Legacy Air case study' },
              { number: '85%', label: 'Quote Accuracy', subtext: 'Based on closing rates' },
              { number: '3x', label: 'Faster Quote Creation', subtext: 'vs manual process' },
              { number: '90%', label: 'Customer Engagement', subtext: 'Quote interaction rate' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl mb-1">{stat.label}</div>
                <div className="text-sm text-blue-200">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-8">Intelligent Property Analysis</h3>
              <ul className="space-y-6">
                {[
                  'Automatic permit and renovation history tracking',
                  'Municipal property data integration',
                  'AI-driven opportunity identification',
                  'Custom templating by industry type'
                ].map((text, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-1">
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    </div>
                    <span className="text-lg">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 p-8 rounded-xl shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop"
                alt="Dashboard Preview"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Enterprise-Ready Integration</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Server className="h-6 w-6" />,
                title: 'Data Import',
                features: ['CSV Upload', 'CRM Integration', 'Bulk Processing']
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: 'Security',
                features: ['Enterprise-grade security', 'Data encryption', 'Role-based access']
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: 'Team Management',
                features: ['Multi-user support', 'Activity tracking', 'Permission controls']
              }
            ].map((card, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
                <ul className="space-y-2 text-gray-600">
                  {card.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-24">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Scale Your Quote Operations?</h2>
          <p className="text-xl text-blue-100 mb-10">
            Join industry leaders already using ServiceScale.ai to generate millions in additional revenue
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 text-lg font-semibold"
          >
            Request Enterprise Demo
          </button>
        </div>
      </section>
    </div>
  );
};

export default Homepage;