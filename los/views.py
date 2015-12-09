from django.shortcuts import render
from django.http.response import HttpResponseRedirect
from django.core.urlresolvers import reverse

from los.forms import WishForm
from los.models import Wish, Choice


def index(request):
    wish_list = Wish.objects.all().filter(person=request.user)
    gift = None
    other_wish = None
    try:
        gift = Choice.objects.get(buyer=request.user)
        other_wish = Wish.objects.all().filter(person=gift.receiver)
    except:
        pass
    context = {
               'wish': wish_list,
               'form': WishForm(),
               'gift': gift,
               'other_wish': other_wish, 
               }
    return render(request, 'los/index.html', context)


def add_wish(request):
    if request.method == "POST":
        form = WishForm(request.POST)
        if form.is_valid():
            wish = form.save(commit=False)
            wish.person = request.user
            wish.save()
    
    return HttpResponseRedirect(reverse('index'))


def draw(request):
    if request.method == "POST":
        pass
    return HttpResponseRedirect(reverse('index'))
