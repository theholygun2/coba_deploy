'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

interface ClientOption {
  name: string;
  type: string;
  personality: string;
  image: string;
  description: string;
}

const ClientSelection: React.FC = () => {
  const { updateState } = useAppContext();

  // Use a fixed version string instead of timestamp for cache busting
  const version = 'v1';
  
  const clients: ClientOption[] = [
    {
      name: 'LoveSummer',
      type: 'Fashion',
      personality: 'Appreciative',
      image: `/clients/lovesummer.png?v=${version}`,
      description: 'Fashion brand for women who love feeling stylish and empowered'
    },
    {
      name: 'GoodFood',
      type: 'F&B',
      personality: 'Outspoken',
      image: `/clients/goodfood.png?v=${version}`,
      description: 'Bold and innovative food & beverage business with a focus on flavor'
    },
    {
      name: 'Gentleman Palace',
      type: 'Barbershop',
      personality: 'Technical',
      image: `/clients/gentlemanpalace.png?v=${version}`,
      description: 'Minimalist barbershop focused on precision and clean grooming'
    }
  ];

  const handleSelectClient = (client: ClientOption) => {
    updateState({
      clientName: client.name,
      clientType: client.type,
      clientPersonality: client.personality,
      currentStep: 3
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Choose Your Client</h1>
        <p className="text-gray-600 text-center mb-8">
          Select a client to work with on their social media campaign
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div 
              key={client.name}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectClient(client)}
            >
              <div className="w-full h-48 relative mb-4 rounded-md overflow-hidden bg-gray-100">
                <Image 
                  src={client.image}
                  alt={`${client.name} logo`}
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    console.error(`Error loading image: ${client.image}`);
                    // Fallback to first letter if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'absolute inset-0 flex items-center justify-center text-gray-400';
                      fallback.innerHTML = `<span class="text-6xl">${client.name[0]}</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <h3 className="text-xl font-bold text-blue-600">{client.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{client.type} • {client.personality}</p>
              <p className="text-gray-700">{client.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSelection;
