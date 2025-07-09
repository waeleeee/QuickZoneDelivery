import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="font-sans bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-lg border-b border-white/30 shadow-lg transition-all duration-500">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-4">
            <img src="/images/quickzonelogo.png" alt="QuickZone Logo" className="h-12" />
            <span className="text-2xl font-bold text-red-600 tracking-wide drop-shadow">QuickZone</span>
          </div>
          <ul className="flex space-x-8 text-lg font-semibold">
            <li><a href="#home" className="hover:text-red-600 transition">Accueil</a></li>
            <li><a href="#features" className="hover:text-red-600 transition">Fonctionnalités</a></li>
            <li><a href="#how-it-works" className="hover:text-red-600 transition">Comment ça marche</a></li>
            <li><a href="#testimonials" className="hover:text-red-600 transition">Témoignages</a></li>
            <li><a href="#contact" className="hover:text-red-600 transition">Contact</a></li>
            <li><a href="#complaints" className="hover:text-red-600 transition">Réclamations</a></li>
            <li><a href="#partner" className="hover:text-red-600 transition">Devenir partenaire</a></li>
            <li><a href="/login" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Dashboard</a></li>
            <li>
              <select className="bg-white/80 text-black border-red-600 border rounded-lg p-1">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[60vh] flex flex-col items-center justify-center text-center fade-in bg-white pt-24 overflow-hidden">
        <svg className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-20 z-0" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="300" cy="300" rx="300" ry="300" fill="url(#paint0_radial)"/>
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(300 300) scale(300)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#dc2626"/>
              <stop offset="1" stopColor="#fff" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>
        <div className="container mx-auto z-10 relative flex flex-col items-center justify-center py-16">
          <div className="w-full mx-auto mb-8 relative h-[60vh]">
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 z-10 pointer-events-none"></div>
              <div className="flex items-center justify-center p-0 absolute inset-0">
                <img src="/images/Hero/1.png" alt="QuickZone Slide 1" className="w-full h-full object-cover mb-4 drop-shadow-lg" />
                <div className="absolute bottom-8 left-8 z-20 text-white text-3xl font-extrabold drop-shadow-lg">
                  Rapide. Fiable. Fièrement Tunisien !
                </div>
                <a href="/login" className="absolute bottom-8 right-8 z-20 bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-red-700 transition">
                  Commencer
                </a>
              </div>
              <img src="/images/quickzonelogo.png" alt="QuickZone Watermark" className="absolute bottom-4 right-4 w-32 opacity-30 z-30 pointer-events-none select-none" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 relative z-20">Livraison Ultra-Rapide, Redéfinie</h1>
          <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-2xl mx-auto relative z-20 font-semibold">Nourriture, courses ou colis—livrés en minutes avec style et rapidité.</p>
          <div className="space-x-6 flex justify-center mb-4 relative z-20">
            <a href="/login" className="bg-red-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-red-700 hover:shadow-xl transition">Commencer</a>
            <a href="#learn-more" className="bg-gray-200 text-black px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-300 transition">En savoir plus</a>
          </div>
        </div>
      </section>

      {/* Slider Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto relative">
          <div className="overflow-hidden rounded-xl shadow-2xl">
            <div className="flex transition-transform duration-700 ease-in-out">
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-600 flex items-center justify-center text-3xl font-bold text-white">Livraison de Fast-Food</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Commander maintenant !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-500 flex items-center justify-center text-3xl font-bold text-white">Courses en Minutes</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Acheter maintenant !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-400 flex items-center justify-center text-3xl font-bold text-white">Suivi de Colis</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Suivre maintenant !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-300 flex items-center justify-center text-3xl font-bold text-white">Devenir Partenaire</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Rejoindre maintenant !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-600 flex items-center justify-center text-3xl font-bold text-white">Paiements Sécurisés</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Payer en sécurité !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-500 flex items-center justify-center text-3xl font-bold text-white">Mises à Jour en Temps Réel</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Rester informé !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-400 flex items-center justify-center text-3xl font-bold text-white">Large Sélection</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Explorer maintenant !</div>
              </div>
              <div className="min-w-full relative slider-item">
                <div className="h-96 bg-red-300 flex items-center justify-center text-3xl font-bold text-white">Amour des Clients</div>
                <div className="slider-overlay absolute inset-0 flex items-center justify-center text-white">Rejoindre l'amour !</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white slide-up">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-red-600">Pourquoi QuickZone Brille</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-100 rounded-xl card-3d">
              <i className="fas fa-rocket text-4xl text-red-600 mb-4"></i>
              <h3 className="text-2xl font-semibold text-black">Livraison Ultra-Rapide</h3>
              <p className="text-gray-600">Vos commandes livrées en seulement 30 minutes, peu importe quoi.</p>
            </div>
            <div className="p-8 bg-gray-100 rounded-xl card-3d">
              <i className="fas fa-map-marker-alt text-4xl text-red-600 mb-4"></i>
              <h3 className="text-2xl font-semibold text-black">Suivi en Temps Réel</h3>
              <p className="text-gray-600">Suivez votre livraison en direct et sachez exactement quand elle arrive.</p>
            </div>
            <div className="p-8 bg-gray-100 rounded-xl card-3d">
              <i className="fas fa-store text-4xl text-red-600 mb-4"></i>
              <h3 className="text-2xl font-semibold text-black">Large Sélection</h3>
              <p className="text-gray-600">Restaurants, courses, boutiques—tout en un seul endroit.</p>
            </div>
            <div className="p-8 bg-gray-100 rounded-xl card-3d">
              <i className="fas fa-calendar-alt text-4xl text-red-600 mb-4"></i>
              <h3 className="text-2xl font-semibold text-black">Livraisons Programmées</h3>
              <p className="text-gray-600">Planifiez vos livraisons pour quand vous en avez le plus besoin.</p>
            </div>
            <div className="p-8 bg-gray-100 rounded-xl card-3d">
              <i className="fas fa-shopping-cart text-4xl text-red-600 mb-4"></i>
              <h3 className="text-2xl font-semibold text-black">Commandes Multiples</h3>
              <p className="text-gray-600">Commandez de plusieurs magasins en une seule livraison et économisez.</p>
            </div>
            <div className="p-8 bg-gray-100 rounded-xl card-3d">
              <i className="fas fa-mobile-alt text-4xl text-red-600 mb-4"></i>
              <h3 className="text-2xl font-semibold text-black">Facile à Utiliser</h3>
              <p className="text-gray-600">Interface intuitive pour commander et suivre sans effort.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-200 slide-up">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-red-600">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl card-3d">
              <div className="text-5xl font-bold text-red-600 mb-4">01</div>
              <h3 className="text-2xl font-semibold text-black">Passez votre commande</h3>
              <p className="text-gray-600">Parcourez les restaurants, courses ou magasins et ajoutez des articles à votre panier.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl card-3d">
              <div className="text-5xl font-bold text-red-600 mb-4">02</div>
              <h3 className="text-2xl font-semibold text-black">Suivez en temps réel</h3>
              <p className="text-gray-600">Regardez votre commande être préparée et livrée en direct.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl card-3d">
              <div className="text-5xl font-bold text-red-600 mb-4">03</div>
              <h3 className="text-2xl font-semibold text-black">Recevez votre livraison</h3>
              <p className="text-gray-600">Recevez vos articles livrés à votre porte avec soin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-white to-red-50 slide-up relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-red-400 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-red-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-red-200 rounded-full animate-pulse"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-red-600 mb-4">Nos chiffres impressionnants</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Rejoignez des milliers de clients satisfaits qui font confiance à QuickZone pour leurs besoins de livraison</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="stat-card group">
              <div className="stat-icon">
                <i className="fas fa-users text-5xl text-red-500 group-hover:text-red-600 transition-colors"></i>
              </div>
              <div className="stat-number">5000</div>
              <div className="stat-label">Clients Satisfaits</div>
              <div className="stat-description">Clients heureux qui aiment notre service</div>
              <div className="stat-badge">
                <i className="fas fa-star text-yellow-400"></i>
                <span>Fiable</span>
              </div>
            </div>

            <div className="stat-card group">
              <div className="stat-icon">
                <i className="fas fa-map-marked-alt text-5xl text-blue-500 group-hover:text-blue-600 transition-colors"></i>
              </div>
              <div className="stat-number">120</div>
              <div className="stat-label">Villes Couvertes</div>
              <div className="stat-description">Couverture nationale à travers la Tunisie</div>
              <div className="stat-badge">
                <i className="fas fa-globe text-green-400"></i>
                <span>En expansion</span>
              </div>
            </div>

            <div className="stat-card group">
              <div className="stat-icon">
                <i className="fas fa-shipping-fast text-5xl text-green-500 group-hover:text-green-600 transition-colors"></i>
              </div>
              <div className="stat-number">50000</div>
              <div className="stat-label">Livraisons Terminées</div>
              <div className="stat-description">Livraisons réussies avec soin</div>
              <div className="stat-badge">
                <i className="fas fa-check-circle text-green-400"></i>
                <span>Fiable</span>
              </div>
            </div>

            <div className="stat-card group">
              <div className="stat-icon">
                <i className="fas fa-heart text-5xl text-pink-500 group-hover:text-pink-600 transition-colors"></i>
              </div>
              <div className="stat-number">98</div>
              <div className="stat-label">Taux de Satisfaction</div>
              <div className="stat-description">Clients qui nous recommandent</div>
              <div className="stat-badge">
                <i className="fas fa-thumbs-up text-blue-400"></i>
                <span>Adoré</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 shadow-lg">
              <i className="fas fa-rocket text-2xl text-red-500 animate-bounce"></i>
              <span className="text-lg font-semibold text-gray-800">Prêt à rejoindre notre histoire de succès ?</span>
              <a href="/login" className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors font-semibold">
                Commencer maintenant
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-16 bg-gray-100 slide-up">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-red-600">Nos Partenaires Stellaires</h2>
          <p className="text-center mb-10 text-gray-600 max-w-2xl mx-auto">Nous nous associons aux meilleures marques pour livrer des produits de qualité à la vitesse de l'éclair.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-xl card-3d text-center">
              <h3 className="text-2xl font-semibold text-black">Mon Jardin</h3>
              <p className="text-gray-600">Services de pépinière et d'aménagement paysager</p>
              <p className="text-sm text-red-600">Partenaire de confiance</p>
            </div>
            <div className="p-6 bg-white rounded-xl card-3d text-center">
              <h3 className="text-2xl font-semibold text-black">Roura Ever Shop</h3>
              <p className="text-gray-600">Produits cosmétiques</p>
              <p className="text-sm text-red-600">Partenaire de confiance</p>
            </div>
            <div className="p-6 bg-white rounded-xl card-3d text-center">
              <h3 className="text-2xl font-semibold text-black">Viaponit</h3>
              <p className="text-gray-600">Multimédia</p>
              <p className="text-sm text-red-600">Partenaire de confiance</p>
            </div>
            <div className="p-6 bg-white rounded-xl card-3d text-center">
              <h3 className="text-2xl font-semibold text-black">Ooredoo</h3>
              <p className="text-gray-600">Opérateur de télécommunications</p>
              <p className="text-sm text-red-600">Partenaire de confiance</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <a href="#partner" className="bg-red-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-red-700 hover:shadow-xl transition">Devenir un partenaire</a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-200 slide-up">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-red-600">Nos Clients Nous Aiment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl card-3d">
              <p className="italic text-gray-600">"QuickZone a révolutionné mes courses. J'économise des heures chaque semaine !"</p>
              <p className="mt-4 font-semibold text-black">Sophie Martin</p>
              <p className="text-sm text-gray-500">Paris, France</p>
            </div>
            <div className="p-8 bg-white rounded-xl card-3d">
              <p className="italic text-gray-600">"Le suivi en temps réel est révolutionnaire. Je sais toujours quand ma commande arrive !"</p>
              <p className="mt-4 font-semibold text-black">Michel Dubois</p>
              <p className="text-sm text-gray-500">Lyon, France</p>
            </div>
            <div className="p-8 bg-white rounded-xl card-3d">
              <p className="italic text-gray-600">"J'utilise QuickZone 3x par semaine. La variété et la vitesse sont inégalées !"</p>
              <p className="mt-4 font-semibold text-black">Émilie Rousseau</p>
              <p className="text-sm text-gray-500">Marseille, France</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white slide-up">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-red-600">Contactez-nous</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-100 rounded-xl card-3d">
              <h3 className="text-2xl font-semibold text-black">Agence Grand Tunis</h3>
              <p className="text-gray-600">Adresse : نهج جمال برج الوزير 2036 سكرة اريانة</p>
              <p className="text-gray-600">Téléphone : +216 24 581 115</p>
              <p className="text-gray-600">Email : grandTunis@quickzone.tn</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl card-3d">
              <h3 className="text-2xl font-semibold text-black">Agence Sahel</h3>
              <p className="text-gray-600">Adresse : قصيبة الميدوني المنستير</p>
              <p className="text-gray-600">Téléphone : +216 28 649 115</p>
              <p className="text-gray-600">Email : sahel@quickzone.tn</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl card-3d">
              <h3 className="text-2xl font-semibold text-black">Agence Centrale</h3>
              <p className="text-gray-600">Adresse : طريق المهدية قصاص بوعلي صفاقس</p>
              <p className="text-gray-600">Téléphone commercial : +216 28 839 115</p>
              <p className="text-gray-600">Service client : +216 28 634 115</p>
              <p className="text-gray-600">Email : sfax@quickzone.tn</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl card-3d">
              <h3 className="text-2xl font-semibold text-black">Direction Générale</h3>
              <p className="text-gray-600">Téléphone : +216 28 681 115 / +216 28 391 115</p>
              <p className="text-gray-600">Email : pdg@quickzone.tn</p>
            </div>
          </div>
          <div className="mt-12 max-w-lg mx-auto bg-gray-100 p-8 rounded-xl card-3d">
            <h3 className="text-2xl font-semibold text-center text-black">Envoyez-nous un message</h3>
            <div className="mt-6 space-y-4">
              <input type="text" placeholder="Prénom" className="w-full p-4 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="Jean" />
              <input type="text" placeholder="Nom" className="w-full p-4 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="Dupont" />
              <input type="email" placeholder="Email" className="w-full p-4 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="jean.dupont@exemple.com" />
              <input type="tel" placeholder="Téléphone" className="w-full p-4 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="+216 28 567 003" />
              <textarea placeholder="Écrivez votre message ici..." rows="4" className="w-full p-4 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black"></textarea>
              <button className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition">Envoyer le message</button>
            </div>
          </div>
        </div>
      </section>

      {/* Complaints Section */}
      <section id="complaints" className="py-16 bg-gray-100 slide-up">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-red-600">Réclamations et Retours</h2>
          <p className="text-center mb-10 text-gray-600 max-w-2xl mx-auto">Votre satisfaction est notre mission. Dites-nous comment nous pouvons nous améliorer.</p>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl card-3d">
            <div className="space-y-4">
              <input type="text" placeholder="Numéro de commande" className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="QZ-12345" />
              <input type="text" placeholder="Nom complet" className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="Jean Dupont" />
              <input type="email" placeholder="Email" className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" defaultValue="jean.dupont@exemple.com" />
              <select className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black">
                <option>Sélectionner le type de problème</option>
                <option>Retard de livraison</option>
                <option>Mauvais article</option>
                <option>Colis endommagé</option>
                <option>Autre</option>
              </select>
              <textarea placeholder="Veuillez fournir des détails sur votre problème..." rows="4" className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black"></textarea>
              <div className="flex items-center space-x-2">
                <input type="file" className="flex-1 p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="confirm" className="w-4 h-4 text-red-600" />
                <label htmlFor="confirm" className="text-gray-700">Je confirme que les informations fournies sont exactes et vraies.</label>
              </div>
              <div className="flex space-x-4">
                <button className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition">Soumettre la réclamation</button>
                <button className="flex-1 bg-gray-300 text-black py-4 rounded-lg font-semibold hover:bg-gray-400 transition">Effacer le formulaire</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/quickzonelogo.png" alt="Quick Zone Logo" className="h-8" />
                <span className="text-xl font-bold">Quick Zone</span>
              </div>
              <p className="text-gray-400">Le service de livraison ultime pour la nourriture, les courses et les colis dans votre région.</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-black">Entreprise</h3>
              <ul className="text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-red-600 transition">À propos</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Carrières</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Presse</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-black">Services</h3>
              <ul className="text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-red-600 transition">Livraison de nourriture</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Livraison de courses</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Livraison de colis</a></li>
                <li><a href="#" className="hover:text-red-600 transition">Solutions d'entreprise</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-black">Support</h3>
              <ul className="text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-red-600 transition">Centre d'aide</a></li>
                <li><a href="#contact" className="hover:text-red-600 transition">Contactez-nous</a></li>
                <li><a href="#" className="hover:text-red-600 transition">FAQ</a></li>
                <li><a href="#partner" className="hover:text-red-600 transition">Devenir partenaire</a></li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto mt-8 text-center">
            <div className="flex justify-center space-x-6 text-2xl">
              <a href="#" className="hover:text-red-600 transition"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-red-600 transition"><i className="fab fa-facebook"></i></a>
              <a href="#" className="hover:text-red-600 transition"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-red-600 transition"><i className="fab fa-linkedin"></i></a>
            </div>
            <p className="mt-4 text-gray-600">© 2025 Quick Zone. Tous droits réservés.</p>
            <div className="flex justify-center space-x-4 mt-2 text-gray-600">
              <a href="#" className="hover:text-red-600 transition">Conditions d'utilisation</a>
              <a href="#" className="hover:text-red-600 transition">Politique de confidentialité</a>
              <a href="#" className="hover:text-red-600 transition">Politique des cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .fade-in { animation: fadeIn 1.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .slide-up { animation: slideUp 1s ease-out; }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .card-3d {
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .card-3d:hover {
          transform: translateY(-10px) rotateX(5deg) rotateY(5deg);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }
        .slider-item:hover .slider-overlay {
          opacity: 1;
        }
        .slider-overlay {
          opacity: 0;
          transition: opacity 0.3s;
          background: rgba(0, 0, 0, 0.5);
        }
        .stat-card {
          @apply bg-white p-8 rounded-2xl shadow-lg text-center relative overflow-hidden;
        }
        .stat-icon {
          @apply mb-4;
        }
        .stat-number {
          @apply text-4xl font-bold text-gray-900 mb-2;
        }
        .stat-label {
          @apply text-lg font-semibold text-gray-700 mb-2;
        }
        .stat-description {
          @apply text-gray-600 mb-4;
        }
        .stat-badge {
          @apply inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 