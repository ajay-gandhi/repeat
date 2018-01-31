import eel

@eel.expose
def console_log(s):
    print "JS console log: " + s

eel.init('web')
eel.start('index.html', size=(320, 120))
