from django.shortcuts import render
from django.http.response import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required

from los.forms import WishForm
from los.models import Wish, Choice
from django.contrib.auth.models import User
from random import randint, seed


@login_required
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


@login_required
def add_wish(request):
    if request.method == "POST":
        form = WishForm(request.POST)
        if form.is_valid():
            wish = form.save(commit=False)
            wish.person = request.user
            wish.save()
    
    return HttpResponseRedirect(reverse('index'))


@login_required
def draw(request):
    if request.method == "POST":
        exc = Choice.objects.all().values_list('receiver', flat=True)
        pool = User.objects.exclude(id=request.user.id).exclude(id__in=exc)
        seed()
        idx = randint(0, len(pool) - 1)
        drawn = pool[idx]
        choice = Choice(buyer=request.user, receiver=drawn)
        choice.save()
        
    return HttpResponseRedirect(reverse('index'))


@login_required
def wish_remove(request):
    return HttpResponseRedirect(reverse('index'))
