import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from sanka_app.models import ExploreCountry, ExploreLandmark

class Command(BaseCommand):
    help = 'Seed Explore Africa data from JSON file into the database'

    def handle(self, *args, **kwargs):
        json_file_path = os.path.join(settings.BASE_DIR, 'explore_data.json')
        
        if not os.path.exists(json_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {json_file_path}"))
            return

        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        countries_data = data.get('countriesData', {})
        countries_details = data.get('countriesDetails', {})

        ExploreLandmark.objects.all().delete()
        ExploreCountry.objects.all().delete()

        for country_id, c_data in countries_data.items():
            details = countries_details.get(country_id, {})
            
            country = ExploreCountry.objects.create(
                id_name=c_data.get('id', country_id),
                name=c_data.get('name', ''),
                local_greeting=c_data.get('localGreeting', ''),
                local_greeting_explanation=c_data.get('localGreetingExplanation', ''),
                capital=c_data.get('capital', ''),
                currency=c_data.get('currency', ''),
                population=c_data.get('population', ''),
                tagline=c_data.get('tagline', ''),
                flag_emoji=c_data.get('flagEmoji', ''),
                overview=c_data.get('overview', ''),
                
                history=details.get('history', ''),
                culture=details.get('culture', ''),
                gastronomy=details.get('gastronomy', ''),
                
                key_facts=details.get('keyFacts', []),
                demographics=details.get('demographics', {}),
                economy=details.get('economy', {}),
                languages=details.get('languages', [])
            )
            
            landmarks = c_data.get('landmarks', [])
            for lm in landmarks:
                ExploreLandmark.objects.create(
                    country=country,
                    landmark_id=lm.get('id', ''),
                    name=lm.get('name', ''),
                    category=lm.get('category', ''),
                    category_label=lm.get('categoryLabel', ''),
                    image=lm.get('image', ''),
                    description=lm.get('description', ''),
                    location=lm.get('location', ''),
                    price=lm.get('price', ''),
                    rating=lm.get('rating', None),
                    tag=lm.get('tag', ''),
                    date_range=lm.get('dateRange', ''),
                    lat=lm.get('lat', None),
                    lng=lm.get('lng', None)
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(countries_data)} countries and their landmarks."))
