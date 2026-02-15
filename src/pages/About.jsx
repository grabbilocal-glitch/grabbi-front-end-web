export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">About Grabbi</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">Quick commerce, delivered</p>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 md:p-8 shadow-card space-y-6 text-gray-700 dark:text-white/80 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Our Mission</h2>
          <p>
            Grabbi is a quick commerce platform built to bring everyday essentials to your door in minutes, not hours. We partner with local franchise stores to provide fast, reliable delivery of groceries, snacks, beverages, and household items.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <p className="text-brand-mint font-bold text-lg mb-1">1</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Browse</p>
              <p>Choose from a wide range of products at your nearest Grabbi franchise store.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <p className="text-brand-mint font-bold text-lg mb-1">2</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Order</p>
              <p>Add items to your cart, set your delivery address, and check out securely.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <p className="text-brand-mint font-bold text-lg mb-1">3</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Receive</p>
              <p>Track your order in real-time and receive it at your doorstep.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loyalty Rewards</h2>
          <p>
            Every order earns you Grabbi loyalty points. Accumulate points and redeem them for discounts on future orders. Join the Grabbi Club to unlock exclusive benefits and track your rewards with your digital club card.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">For Franchise Partners</h2>
          <p>
            Grabbi provides franchise owners with a complete platform to manage inventory, process orders, and reach more customers. Our franchise dashboard includes real-time analytics, delivery management, and customer engagement tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Us</h2>
          <p>
            Have questions or feedback? We would love to hear from you. Reach out at <span className="text-brand-mint">hello@grabbi.co.uk</span>.
          </p>
        </section>
      </div>
    </div>
  )
}
