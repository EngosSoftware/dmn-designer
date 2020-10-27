call ng build --prod
call docker login
call docker image build -t mateuszstaszkow/frontend-decisiontable:1.0 .
call docker push mateuszstaszkow/frontend-decisiontable:1.0
