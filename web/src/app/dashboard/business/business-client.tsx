'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Business, BusinessHours, Category } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Settings, Store } from 'lucide-react'
import { useState } from 'react'
import { HoursTab } from './components/hours-tab'
import { ProfileTab } from './components/profile-tab'
import { SettingsTab } from './components/settings-tab'

interface Props {
	business: Business
	categories: Pick<Category, 'id' | 'name' | 'slug'>[]
	hours: BusinessHours[]
}

export function BusinessClient({ business, categories, hours: initialHours }: Props) {
	const [activeTab, setActiveTab] = useState('profile')

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Business</h1>
				<p className="text-muted-foreground">Manage your business profile, hours, and settings.</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-6">
					<TabsTrigger value="profile" className="gap-2">
						<Store className="h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger value="hours" className="gap-2">
						<Clock className="h-4 w-4" />
						Hours
					</TabsTrigger>
					<TabsTrigger value="settings" className="gap-2">
						<Settings className="h-4 w-4" />
						Settings
					</TabsTrigger>
				</TabsList>

				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
					>
						<TabsContent value="profile" forceMount={activeTab === 'profile' ? true : undefined} className={activeTab !== 'profile' ? 'hidden' : ''}>
							<ProfileTab business={business} categories={categories} />
						</TabsContent>
						<TabsContent value="hours" forceMount={activeTab === 'hours' ? true : undefined} className={activeTab !== 'hours' ? 'hidden' : ''}>
							<HoursTab businessId={business.id} initialHours={initialHours} />
						</TabsContent>
						<TabsContent value="settings" forceMount={activeTab === 'settings' ? true : undefined} className={activeTab !== 'settings' ? 'hidden' : ''}>
							<SettingsTab business={business} />
						</TabsContent>
					</motion.div>
				</AnimatePresence>
			</Tabs>
		</div>
	)
}
