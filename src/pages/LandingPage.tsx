
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Coins, Activity, TrendingUp, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-heading">
            Turn Promises into Real Accountability — <br className="hidden md:block" />
            Powered by Web3
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create crypto-staked pacts with your buddy to hold each other accountable and achieve your goals together.
          </p>
          <Button size="lg" className="gradient-btn text-white px-8 py-6 h-auto text-lg rounded-xl neumorph">
            <Link to="/create" className="flex items-center gap-2">
              Start Your Pact <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Problem/Solution Block */}
      <section className="bg-neutral-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">The Problem</h2>
              <p className="text-muted-foreground">
                We all know how easily promises are broken when there's nothing at stake. From fitness goals to learning commitments, accountability is often missing.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Solution</h2>
              <p className="text-muted-foreground">
                BitBuddies leverages blockchain technology to create real stakes. By committing SOL tokens to your pact, both parties have a tangible incentive to follow through.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center gradient-heading mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="neumorph-card p-8 text-center">
            <div className="bg-bit-purple/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Check className="text-bit-purple w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Make a Pact</h3>
            <p className="text-muted-foreground">
              Set clear goals with your accountability buddy. Define objectives, timeframe, and success criteria.
            </p>
          </div>
          
          <div className="neumorph-card p-8 text-center">
            <div className="bg-bit-orange/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Coins className="text-bit-orange w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Stake SOL</h3>
            <p className="text-muted-foreground">
              Both parties stake Solana tokens as collateral, creating a financial incentive to follow through.
            </p>
          </div>
          
          <div className="neumorph-card p-8 text-center">
            <div className="bg-bit-pink/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <ArrowRight className="text-bit-pink w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Stay Accountable</h3>
            <p className="text-muted-foreground">
              Complete your tasks and verify your buddy's progress. Succeed together or lose your stake.
            </p>
          </div>
        </div>
      </section>

      {/* Use Case Cards */}
      <section className="bg-neutral-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center gradient-heading mb-16">Perfect For Any Goal</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none neumorph overflow-hidden">
              <AspectRatio ratio={16/9} className="bg-bit-light-purple">
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-bit-purple/20 to-bit-purple/5">
                  <Activity className="w-12 h-12 text-bit-purple" />
                </div>
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Fitness</h3>
                <p className="text-muted-foreground">
                  Commit to workout schedules, running goals, or weight targets with your gym buddy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none neumorph overflow-hidden">
              <AspectRatio ratio={16/9} className="bg-bit-light-purple">
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-bit-orange/20 to-bit-orange/5">
                  <TrendingUp className="w-12 h-12 text-bit-orange" />
                </div>
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Productivity</h3>
                <p className="text-muted-foreground">
                  Hold each other accountable for daily work goals, side projects, or creative endeavors.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none neumorph overflow-hidden">
              <AspectRatio ratio={16/9} className="bg-bit-light-purple">
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-bit-pink/20 to-bit-pink/5">
                  <BookOpen className="w-12 h-12 text-bit-pink" />
                </div>
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Study Goals</h3>
                <p className="text-muted-foreground">
                  Succeed in learning new skills or completing courses by keeping each other on track.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center gradient-heading mb-16">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="neumorph-card p-8">
            <p className="italic text-muted-foreground mb-6">
              "I finally completed my 30-day coding challenge because I had 2 SOL on the line. My buddy and I both succeeded and it was worth every token!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-bit-purple/20 flex items-center justify-center">
                <span className="font-bold text-bit-purple">AK</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Alex K.</h4>
                <p className="text-sm text-muted-foreground">Frontend Developer</p>
              </div>
            </div>
          </div>
          
          <div className="neumorph-card p-8">
            <p className="italic text-muted-foreground mb-6">
              "BitBuddies changed the game for my fitness goals. Having my best friend as my accountability partner with our tokens at stake made all the difference."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-bit-orange/20 flex items-center justify-center">
                <span className="font-bold text-bit-orange">MC</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Maya C.</h4>
                <p className="text-sm text-muted-foreground">Fitness Enthusiast</p>
              </div>
            </div>
          </div>
          
          <div className="neumorph-card p-8">
            <p className="italic text-muted-foreground mb-6">
              "After failing to finish my online course three times, I used BitBuddies with my colleague. We both completed it within a month!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-bit-pink/20 flex items-center justify-center">
                <span className="font-bold text-bit-pink">TJ</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Tyler J.</h4>
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-10">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-bit-purple to-bit-pink p-12 rounded-2xl neumorph">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Achieve Your Goals?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Create your first accountability pact today and unlock the power of commitment with blockchain incentives.
          </p>
          <Button size="lg" variant="secondary" className="px-8 py-6 h-auto text-lg rounded-xl neumorph">
            <Link to="/login">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer with links and social icons */}
      <footer className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-bit-purple mb-2">BitBuddies</h2>
              <p className="text-sm text-muted-foreground">© 2025 BitBuddies. All rights reserved.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold mb-3">Platform</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-muted-foreground hover:text-bit-purple">Home</Link></li>
                  <li><Link to="/features" className="text-muted-foreground hover:text-bit-purple">Features</Link></li>
                  <li><Link to="/pricing" className="text-muted-foreground hover:text-bit-purple">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/blog" className="text-muted-foreground hover:text-bit-purple">Blog</Link></li>
                  <li><Link to="/guide" className="text-muted-foreground hover:text-bit-purple">User Guide</Link></li>
                  <li><Link to="/faq" className="text-muted-foreground hover:text-bit-purple">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-muted-foreground hover:text-bit-purple">About Us</Link></li>
                  <li><Link to="/contact" className="text-muted-foreground hover:text-bit-purple">Contact</Link></li>
                  <li><Link to="/terms" className="text-muted-foreground hover:text-bit-purple">Terms</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0">
              <h3 className="font-semibold mb-3 text-center md:text-left">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="p-2 rounded-full bg-white neumorph text-bit-purple hover:text-bit-pink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-white neumorph text-bit-purple hover:text-bit-pink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-white neumorph text-bit-purple hover:text-bit-pink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-white neumorph text-bit-purple hover:text-bit-pink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
