from django.forms import ModelForm
from los.models import Wish


class WishForm(ModelForm):
    class Meta:
        model = Wish
        fields = ['name']
    